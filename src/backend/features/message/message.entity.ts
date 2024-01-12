import {
  Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Chat } from '../chat/chat.entity';
  
@Entity({name: 'messages'})
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, chat => chat.id)
  chat: Chat;

  @Column()
  text: string;

  @Column({name: 'is_from_user'})
  // If it's false it's generated response from GPT model.
  isFromUser: boolean;
}