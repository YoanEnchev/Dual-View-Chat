import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import UserPublishesMessagePayload from 'src/shared/interfaces/UserPublishesMessagePayload';
import { JwtService } from '@nestjs/jwt';
import IServiceOperationResponse from 'src/backend/common/interfaces/IServiceOperationResponse';
import { MessageService } from './message.service';
import { OpenAIGPTService } from '../open-ai-gpt/open-ai-gpt.service';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import ICreateMessageServiceResponse from './serviceOperationResponses/IExtractChatMessages';
import IGPTModelTextResponse from '../open-ai-gpt/serviceOperationResponses/IGPTModelTextResponse';
import IDataFromAccessToken from '../auth/interfaces/IDataFromAccessToken';
import IMessageProcessingError from 'src/shared/interfaces/IMessageProcessingError';
import IMessageJSONFormat from 'src/shared/interfaces/IMessageJSONFormat';
  

@WebSocketGateway(4001, {cors: '*', transports: ['websocket', 'polling']} )
export class MessageGateway {
    @WebSocketServer() server: Server;

    constructor(
        @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(MessageService) private readonly messageService: MessageService,
        @Inject(OpenAIGPTService) private readonly openAIGPTService: OpenAIGPTService,
    ) {}

    @SubscribeMessage('user-publishes-message')
    async handleUserPublishingMessage(@MessageBody() messagePublishPayload: UserPublishesMessagePayload): Promise<void> {
    
        const decodedAccessTokenData: IDataFromAccessToken|null = this.jwtService.decode(messagePublishPayload.userAccessToken);

        const chatID: number = messagePublishPayload.chatID;
        const messageClientIDToProcess = messagePublishPayload.msgClientID; // So it's known to which message has GPT responded to.

        const errorChannel: string = `error-for-chat-${chatID}`;
        const messageInsertedChannel: string = `message-inserted-for-chat-${chatID}`;

        const errorResponse: IMessageProcessingError = {
            msgClientID: messageClientIDToProcess,
            errorMessage: '' // Set it before emitting,
        }
        
        if (decodedAccessTokenData == null) {
            errorResponse.errorMessage = 'Invalid token. Try signing in again.'
            this.server.emit(errorChannel, errorResponse);
            return;
        }

        const userTextMessage: any = messagePublishPayload.msgText // The any type is validated on the next lines.
        const textMsgValidationResult: IServiceOperationResponse = await this.messageService.msgTextIsValid(userTextMessage)

        if (textMsgValidationResult.status !== ServiceOperationStatuses.SUCCESS) {
            errorResponse.errorMessage = textMsgValidationResult.errorMessage;
            this.server.emit(errorChannel, errorResponse);
            return;
        }

        userTextMessage as string // It's guaranteed that it's a string since it passed validation and the next services can use it.

        const userCreatesMsgPromise: Promise<ICreateMessageServiceResponse> = this.messageService.create(decodedAccessTokenData, chatID, userTextMessage, true);
        const gptTextResponsePromise: Promise<IGPTModelTextResponse> = this.openAIGPTService.respondToText(userTextMessage);


        userCreatesMsgPromise.then((msgCreationResponse: ICreateMessageServiceResponse) => {

            // Emit that message was inserted as soon as possible.
            if (msgCreationResponse.status == ServiceOperationStatuses.SUCCESS) {
                this.server.emit(messageInsertedChannel, msgCreationResponse.messageObject);
            }
        })

        // Wait for the promises to settle even if one of them fails.
        // Start saving record of the user message and fetch GPT model response at the same time without waiting for the insertion to finish.
        const [userCreatesMsgResult, gptTextResponseResult] = await Promise.all([userCreatesMsgPromise, gptTextResponsePromise])

        if (gptTextResponseResult.status != ServiceOperationStatuses.SUCCESS) {
            errorResponse.errorMessage = gptTextResponseResult.errorMessage;
            this.server.emit(errorChannel, errorResponse);
            return;
        }

        if (userCreatesMsgResult.status != ServiceOperationStatuses.SUCCESS) {
            errorResponse.errorMessage = userCreatesMsgResult.errorMessage;
            this.server.emit(errorChannel, errorResponse);
            return;
        }

        // Save GPT model response after user's message is saved to the database so we can guarantee that it's insertion date is after user's message.
        const aiCreatesMsgResult: ICreateMessageServiceResponse = await this.messageService.create(decodedAccessTokenData, chatID, gptTextResponseResult.textResponse, false);
        
        if (aiCreatesMsgResult.status != ServiceOperationStatuses.SUCCESS) {
            errorResponse.errorMessage = aiCreatesMsgResult.errorMessage;
            this.server.emit(errorChannel, errorResponse);
            return;
        }

        const msgObjectToSend: IMessageJSONFormat = aiCreatesMsgResult.messageObject;

        // So it's known to which message has GPT responded to.
        msgObjectToSend.gptResponseToClientIDMsg = messageClientIDToProcess;

        this.server.emit(messageInsertedChannel, msgObjectToSend);
    }
}