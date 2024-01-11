import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, } from 'express';
import { ISessionAttributes } from '../session/ISessionAttributes';

@Injectable()
export class isAuthenticatedMiddleware implements NestMiddleware {
    
  use(req: Request, res: Response, next: () => void) {
    const sessionData = req.session as ISessionAttributes;

    if (!sessionData.user) {
        throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              errors: {
                message: 'You need to login to perform this action.',
              },
            },
            HttpStatus.UNAUTHORIZED,
          );
    }
    
    next();
  }
}

