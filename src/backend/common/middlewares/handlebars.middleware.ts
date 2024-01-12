import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, } from 'express';
import { ISessionAttributes } from '../interfaces/session/ISessionAttributes';

@Injectable()
export class HandlebarsMiddleware implements NestMiddleware {
    

  use(req: Request, res: Response, next: () => void) {

    const sessionData = req.session as ISessionAttributes;

    // What variables can be accessed in view:
    res.locals.isLoggedIn = !!sessionData.user
    
    next();
  }
}

