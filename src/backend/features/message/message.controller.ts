import { Controller, HttpException, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import * as express from 'express';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import ICreateMessageServiceResponse from './serviceOperationResponses/IExtractChatMessages';
import { OpenAIGPTService } from '../open-ai-gpt/open-ai-gpt.service';
import IServiceOperationResponse from 'src/backend/common/interfaces/IServiceOperationResponse';
import IGPTModelTextResponse from '../open-ai-gpt/serviceOperationResponses/IGPTModelTextResponse';

@Controller()
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly openAIGPTService: OpenAIGPTService
  ) {}

  @Post('/chats/:chatID/message')
  async create(@Param('chatID') chatID: number, @Req() request: express.Request) {

    const userTextMessage: any = request.body.text // The any type is validated on the next lines.
    const textMsgValidationResult: IServiceOperationResponse = await this.messageService.msgTextIsValid(userTextMessage)

    if (textMsgValidationResult.status !== ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: textMsgValidationResult.errorMessage}, HttpStatus.BAD_REQUEST
      );
    }

    userTextMessage as string // It's guaranteed that it's a string since it passed validation and the next services can use it.

    const userCreatesMsgPromise: Promise<ICreateMessageServiceResponse> = this.messageService.create(request, chatID, userTextMessage, true);
    const gptTextResponsePromise: Promise<IGPTModelTextResponse> = this.openAIGPTService.respondToText(userTextMessage);

    // Wait for the promises to settle. Even if one of them fails - continue ahead and check it's result.
    // Start saving record of the user message and fetch GPT model response at the same time without waiting for the insertion to finish.
    const [userCreatesMsgResult, gptTextResponse] = await Promise.all([userCreatesMsgPromise, gptTextResponsePromise])
    
    if (userCreatesMsgResult.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: userCreatesMsgResult.errorMessage}, 
        userCreatesMsgResult.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    if (gptTextResponse.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: gptTextResponse.errorMessage}, 
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // Save GPT model response after user message is saved to the database so we can guarantee that it's insertion date is right.
    const aiCreatesMsgResult: ICreateMessageServiceResponse = await this.messageService.create(request, chatID, gptTextResponse.textResponse, false);

    if (aiCreatesMsgResult.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: aiCreatesMsgResult.errorMessage}, 
        aiCreatesMsgResult.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {messagesObjects: [userCreatesMsgResult.messageObject, aiCreatesMsgResult.messageObject]};
  }
}
