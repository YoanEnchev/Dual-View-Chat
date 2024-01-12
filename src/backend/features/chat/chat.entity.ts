import {
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { User } from '../user/user.entity';
import { Message } from '../message/message.entity';
  
@Entity({name: 'chats'})
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id, { eager: true })
  user: User;

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];
}