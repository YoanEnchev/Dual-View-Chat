import { Controller, Get, HttpException, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import * as express from 'express';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService,) {}

  @Post('/chats/:chatID/message')
  async create(@Param('chatID') chatID: number, @Req() request: express.Request) {
    
    const result = await this.messageService.create(request, chatID, true);

    if (result.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: result.errorMessage}, 
        result.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {message: 'Successful message creation.'};
  }
}
