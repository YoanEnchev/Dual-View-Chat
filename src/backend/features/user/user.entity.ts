import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
  } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Chat } from '../chat/chat.entity';
  
  @Entity({name: 'users'})
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    // For "string | null" we need to use String type.
    // More info: https://github.com/typeorm/typeorm/issues/2567
    @Column({ type: String, unique: true })
    email: string;
  
    @Column()
    password: string;
  
    public previousPassword: string;

    @OneToMany(() => Chat, chat => chat.user)
    chats: Chat[];
  
    @BeforeInsert()
    @BeforeUpdate()
    async setPassword() {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }