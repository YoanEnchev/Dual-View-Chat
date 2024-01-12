import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async createInitialChatsForUser(user: User): Promise<Chat[]> {

    return this.entityManager.transaction(async transactionalEntityManager => {
    
      const chat1 = transactionalEntityManager.create(Chat, { user });
      const chat2 = transactionalEntityManager.create(Chat, { user });

      await Promise.all(
        [transactionalEntityManager.save(Chat, chat1), 
        transactionalEntityManager.save(Chat, chat2)
      ]);
      
      return [chat1, chat2]
    });
  }
}