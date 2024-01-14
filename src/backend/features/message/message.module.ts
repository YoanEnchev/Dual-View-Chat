import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { OpenAIGPTModule } from '../open-ai-gpt/open-ai-gpt.module';
import { MessageGateway } from './message.socket.gateway';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [TypeOrmModule.forFeature([Message]), OpenAIGPTModule, AuthModule],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService, MessageGateway]
})
export class MessageModule {}
