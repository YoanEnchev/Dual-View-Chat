import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as express from 'express';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { MessageCreateRequest } from './requests/message.create';
import { Chat } from '../chat/chat.entity';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import IServiceOperationResponse from 'src/backend/common/interfaces/IServiceOperationResponse';
import { validate } from 'class-validator';
import { ISessionAttributes } from 'src/backend/common/interfaces/session/ISessionAttributes';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async create(req: express.Request, isFromUser: boolean): Promise<IServiceOperationResponse> {

    const messageCreationRequest: MessageCreateRequest = Object.assign(new MessageCreateRequest(), req.body);

    const errors = await validate(messageCreationRequest);

    if (errors.length > 0) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: Object.values(errors[0].constraints)[0]
      };
    }

    const chat: Chat|null = await this.chatRepository.findOne({where: {id: messageCreationRequest.chatID}})

    if (chat == null) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: 'Chat with such id does not exist.'
      };
    }

    const sessionData = req.session as ISessionAttributes;

    // Assume user is logged in.
    // Guest will not be allowed to permit this operation.
    if (chat.user.id != sessionData.user!.id) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: 'The chat does not belong to this user.'
      };
    }

    await this.messageRepository.save(
      this.messageRepository.create({
        text: messageCreationRequest.text,
        chat: chat
      }),
    );

    return {
      status: ServiceOperationStatuses.SUCCESS
    }
  }
}