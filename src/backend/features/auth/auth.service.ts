import { HttpException, HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { RegistrationRequest } from './validations/user.register';
import { LoginRequest } from './validations/user.login';
import { validate } from 'class-validator';
import { UserService } from '../user/user.service';
import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import { ISessionAttributes } from 'src/backend/common/session/ISessionAttributes';
import { User } from '../user/user.entity';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
  ) {}

  async handleRegistration(req: express.Request) {
    const registrationRequest: RegistrationRequest = Object.assign(new RegistrationRequest(), req.body);

    const errors = await validate(registrationRequest);

    if (errors.length > 0) {
      throw new HttpException({message: Object.values(errors[0].constraints)[0]}, HttpStatus.BAD_REQUEST);
    }

    const user: User = await this.userService.create(registrationRequest)

    this.loginUser(req, user)
  }

  async handleLogin(req: express.Request) {

    const loginRequest: LoginRequest = Object.assign(new LoginRequest(), req.body);

    const errors = await validate(loginRequest);

    if (errors.length > 0) {
      throw new HttpException({message: Object.values(errors[0].constraints)[0]}, HttpStatus.BAD_REQUEST);
    }

    const user: User = await this.userService.findByEmail(loginRequest.email);

    if (!user) {
      throw new HttpException({message: 'User with such email does not exist.'}, HttpStatus.BAD_REQUEST);
    }

    const isValidPassword = await bcrypt.compare(loginRequest.password, user.password);

    if (!isValidPassword) {
      throw new HttpException({message: 'Password mismatch.'}, HttpStatus.BAD_REQUEST);
    }

    this.loginUser(req, user);
  }

  loginUser(req: express.Request, user: User) {
    const sessionData = req.session as ISessionAttributes;

    sessionData.user = user;
  }

  logoutUser(req: express.Request) {
    const sessionData = req.session as ISessionAttributes;

    sessionData.user = null
  }

  getHello(): string {
    return 'Hello World! xxxzzz';
  }
}
