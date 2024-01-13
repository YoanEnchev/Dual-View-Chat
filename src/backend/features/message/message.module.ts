import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { OpenAIGPTModule } from '../open-ai-gpt/open-ai-gpt.module';


@Module({
  imports: [TypeOrmModule.forFeature([Message]), OpenAIGPTModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
