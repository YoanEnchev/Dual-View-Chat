import { Controller, Get, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import * as express from 'express';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('/post-message')
  async create(@Req() request: express.Request) {
    
    const result = await this.messageService.create(request, true);

    if (result.status == ServiceOperationStatuses.ERROR) {
      throw new HttpException({message: result.errorMessage}, HttpStatus.BAD_REQUEST);
    }

    return {message: 'Successful message creation.'};
  }
}
