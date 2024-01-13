import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../user/user.entity';
import IInitializingUserChats from './serviceOperationResponses/IInitializingUserChats';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import { Message } from '../message/message.entity';
import IExtractChatMessages from './serviceOperationResponses/IExtractChatMessages';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

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

  async getMessages(user: User, chatId: number, skip: number): Promise<IExtractChatMessages> {

    try {
      if (!user.chats.some(chat => chat.id)) {
        return {
          status: ServiceOperationStatuses.BAD_REQUEST, 
          errorMessage: "Cannot access chat that doesn't belong to the user"
        }
      }

      const chat = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.messages', 'message')
        .where('chat.id = :chatId', { chatId })
        .orderBy('message.createdAt', 'DESC')
        .skip(skip)
        .take(10)
        .getOne();

      if (!chat) {
        return {
          status: ServiceOperationStatuses.BAD_REQUEST, 
          errorMessage: 'Chat not found'
        }
      }

      return {
        status: ServiceOperationStatuses.SUCCESS,
        messages: chat.messages
      }
    }
    catch (error) {
      // Implement better logging if deploying to production.
      console.error('Error in ChatService.getMessages:', error);


      return {status: ServiceOperationStatuses.INTERNAL_ERROR, errorMessage: error.message}
    }
  }
}