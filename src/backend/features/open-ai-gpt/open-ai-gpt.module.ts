import { Module } from '@nestjs/common';
import { OpenAIGPTService } from './open-ai-gpt.service';
import OpenAI from 'openai';


@Module({
  imports: [],
  controllers: [],
  providers: [OpenAIGPTService, OpenAI],
  exports: [OpenAIGPTService]
})
export class OpenAIGPTModule {}
