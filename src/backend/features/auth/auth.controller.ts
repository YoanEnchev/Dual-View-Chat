import { Controller, Get, Post, Render, Redirect, Req, Res, HttpStatus } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller()
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Get('/register')
  @Render('auth/register')
  showRegistrationForm() {}

  @Post('/register')
  async register(@Req() request: Request) {
    this.authService.handleRegistration(request);

    return {message: 'Successful registration.'};
  }

  @Get('/login')
  @Render('auth/login')
  showLoginForm() {}

  @Post('/login')
  async login(@Req() request: express.Request) {
    
    this.authService.handleLogin(request);

    return {message: 'Successful login.'};
  }

  @Post('/logout')
  @Redirect('/succ-logout', 302)
  async logout(@Req() request: express.Request) {
    return this.authService.logoutUser(request);
  }
}
