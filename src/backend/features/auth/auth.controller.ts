import { Controller, Get, Post, Render, Redirect, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { Request } from 'express';
import IServiceOperationResponse from 'src/backend/common/interfaces/IServiceOperationResponse';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';

@Controller()
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Get('/register')
  @Render('auth/register')
  showRegistrationForm() {}

  @Post('/auth/register')
  async register(@Req() request: Request) {
    
    const result: IServiceOperationResponse = await this.authService.handleRegistration(request);

    if (result.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: result.errorMessage}, 
        result.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {message: 'Successful registration.'};
  }

  @Get('/login')
  @Render('auth/login')
  showLoginForm() {}

  @Post('/auth/login')
  async login(@Req() request: express.Request) {
    
    const result = await this.authService.handleLogin(request);

    if (result.status != ServiceOperationStatuses.SUCCESS) {
      throw new HttpException(
        {message: result.errorMessage}, 
        result.status == ServiceOperationStatuses.BAD_REQUEST ? HttpStatus.BAD_REQUEST : HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {message: 'Successful registration.'};
  }

  @Post('/logout')
  @Redirect('/succ-logout', 302)
  logout(@Req() request: express.Request) {
    return this.authService.logoutUser(request);
  }

  @Get('/succ-login')
  @Render('auth/successful-login')
  successfulLogin() {
    return {}
  }

  @Get('/succ-registration')
  @Render('auth/successful-registration')
  successfulRegistration() {
    return {}
  }

  @Get('/succ-logout')
  @Render('auth/successful-logout')
  successfulLogout() {
    return {}
  }

  @Get('/user/access-token')
  getAccessToken(@Req() req: express.Request) {
    return this.authService.getUserAccessToken(req);
  }
}
