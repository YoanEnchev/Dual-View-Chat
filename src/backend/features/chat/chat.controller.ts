import { Controller, Get, HttpException, HttpStatus, Param, Render, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import * as express from 'express';
import { ISessionAttributes } from 'src/backend/common/interfaces/session/ISessionAttributes';
import IInitializingUserChats from './serviceOperationResponses/IInitializingUserChats';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';
import { Chat } from './chat.entity';
import IExtractChatMessages from './serviceOperationResponses/IExtractChatMessages';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/chats')
  @Render('chats/index')
  async list(@Req() req: express.Request) {

    const sessionData = req.session as ISessionAttributes;

    // User is expected to always be set (authenticated) when accessing this route.
    const result: IInitializingUserChats = await this.chatService.initializeUserChatsIfNeeded(sessionData.user!)

    if (result.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: result.errorMessage}, 
        result.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {
      fromServer: {
        chatsIDS: result.chats!.map((chat: Chat) => chat.id)
      }
    }
  }

  @Get('/chats/:chatID/messages')
  async create(@Param('chatID') chatID: number, @Req() req: express.Request) {
    const sessionData = req.session as ISessionAttributes;

    // User is expected to always be set (authenticated) when accessing this route.
    const result: IExtractChatMessages = await this.chatService.getMessages(sessionData.user!, chatID, 0);

    if (result.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: result.errorMessage}, 
        result.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return result.messages
  }
}
