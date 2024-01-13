import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import IGPTModelTextResponse from './serviceOperationResponses/IGPTModelTextResponse';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';

@Injectable()
export class OpenAIGPTService {
  constructor(private readonly openAI: OpenAI) {}

  async respondToText(text: string): Promise<IGPTModelTextResponse> {

    try {
      const completion = await this.openAI.chat.completions.create({
        messages: [{ 
          role: "system", 
          content: text
        }],
        model: "gpt-3.5-turbo",
      });
    
      return {status: ServiceOperationStatuses.SUCCESS, textResponse: completion.choices[0].message.content.trim()}
    }
    catch (error) {
      // Implement better logging if deploying to production.
      console.error('Error in OpenAIGPTService.respondToText:', error);

      return {status: ServiceOperationStatuses.INTERNAL_ERROR, textResponse: 'Service not available. Please try again later.'}
    }
  }
}