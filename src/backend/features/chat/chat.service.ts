import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../user/user.entity';
import * as express from 'express';
import IInitializingUserChats from './serviceOperationResponses/IInitializingUserChats';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import IExtractChatMessages from './serviceOperationResponses/IExtractChatMessages';
import { ISessionAttributes } from 'src/backend/common/interfaces/session/ISessionAttributes';
import IMessageJSONFormat from 'src/shared/interfaces/IMessageJSONFormat';
import { Message } from '../message/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async initializeUserChatsIfNeeded(user: User): Promise<IInitializingUserChats> {

    // If chats are already created.
    if (user.chats.length > 0) {
      return { status: ServiceOperationStatuses.SUCCESS, chats: user.chats }
    }

    try {
      // Triggers when user accesses his/her chat room for the first time. 
      return this.entityManager.transaction(async transactionalEntityManager => {
      
        const chat1 = transactionalEntityManager.create(Chat, { user });
        const chat2 = transactionalEntityManager.create(Chat, { user });

        await Promise.all(
          [transactionalEntityManager.save(Chat, chat1), 
          transactionalEntityManager.save(Chat, chat2)
        ]);

        return { status: ServiceOperationStatuses.SUCCESS, chats: user.chats }
      });
    }
    catch (error) {
      // Implement better logging if deploying to production.
      console.error('Error in ChatService.initializeUserChatsIfNeeded:', error);


      return {status: ServiceOperationStatuses.INTERNAL_ERROR, errorMessage: 'Service not available. Please try again later.'}
    }
  }

  async getMessages(req: express.Request, chatId: number, skip: number): Promise<IExtractChatMessages> {

    if (!Number.isInteger(skip) && skip > 1000) {
      return {
        status: ServiceOperationStatuses.BAD_REQUEST, 
        errorMessage: "Invalid value for skip parameter"
      }
    }
    
    const sessionData = req.session as ISessionAttributes;

    // User is expected to always be set (authenticated) when accessing this route.
    const user:User = sessionData.user!
    
    try {
      if (!user.chats.some(chat => chat.id)) {
        return {
          status: ServiceOperationStatuses.BAD_REQUEST, 
          errorMessage: "Cannot access chat that doesn't belong to the user"
        }
      }

      const messages: Message[] = await this.messageRepository
        .createQueryBuilder('msg')
        .where('msg.chat_id = :chatId', { chatId })
        .orderBy('msg.createdAt', 'DESC')
        .skip(skip)
        .take(10)
        .getMany()
        
      // Sort the messages array in ascending order if needed
      const sortedMessages: Message[] =messages.sort((a: Message, b: Message) => a.createdAt.getTime() - b.createdAt.getTime());

      return {
        status: ServiceOperationStatuses.SUCCESS,
        messages: sortedMessages.map((message: Message) => {
          const responseResult: IMessageJSONFormat = {
            text: message.text,
            isFromUser: message.isFromUser
          }
          
          return responseResult
        })
      }
    }
    catch (error) {
      // Implement better logging if deploying to production.
      console.error('Error in ChatService.getMessages:', error);


      return {status: ServiceOperationStatuses.INTERNAL_ERROR, errorMessage: error.message}
    }
  }
}