import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { MessageCreateRequest } from './requests/message.create';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import { validate } from 'class-validator';
import ICreateMessageServiceResponse from './serviceOperationResponses/IExtractChatMessages';
import IMessageJSONFormat from 'src/shared/interfaces/IMessageJSONFormat';
import IServiceOperationResponse from 'src/backend/common/interfaces/IServiceOperationResponse';
import IDataFromAccessToken from '../auth/interfaces/IDataFromAccessToken';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // Must be called only after the method for validating the message's text.
  async create(dataFromAccessToken: IDataFromAccessToken, chatID: number, msgText: string, isFromUser: boolean): Promise<ICreateMessageServiceResponse> {

    if (!dataFromAccessToken.chatIDs.some((loopChatID: number) => loopChatID == chatID)) {
      return {
        status: ServiceOperationStatuses.BAD_REQUEST, errorMessage: 'The chat does not belong to this user.'
      };
    }

    try {
      const message: Message = await this.messageRepository.save(
        this.messageRepository.create({
          text: msgText.trim(),
          chat: {
            id: chatID
          },
          isFromUser
        }),
      );

      const messageObjectResponse: IMessageJSONFormat = {
        text: message.text,
        isFromUser: message.isFromUser
      }

      return {
        status: ServiceOperationStatuses.SUCCESS,
        messageObject: messageObjectResponse
      }
    }
    catch (error) {
      // Implement better logging if deploying to production.
      console.error('Error in MessageService.create:', error);

      return {
        status: ServiceOperationStatuses.INTERNAL_ERROR,
        errorMessage: 'Service not available'
      }
    }
  }

  // msgText is of type any and will be validated (including it's type) in MessageCreateRequest.
  async msgTextIsValid(msgText: any): Promise<IServiceOperationResponse> {
    const messageCreationRequest: MessageCreateRequest = Object.assign(new MessageCreateRequest(), {
      text: msgText
    });

    const errors = await validate(messageCreationRequest);

    if (errors.length > 0) {
      return {
        status: ServiceOperationStatuses.BAD_REQUEST, errorMessage: Object.values(errors[0].constraints)[0]
      };
    }

    return {status: ServiceOperationStatuses.SUCCESS};
  }
}