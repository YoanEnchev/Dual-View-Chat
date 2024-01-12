import { Injectable } from '@nestjs/common';
import { RegistrationRequest } from './validations/user.register';
import { LoginRequest } from './validations/user.login';
import { validate } from 'class-validator';
import { UserService } from '../user/user.service';
import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import { ISessionAttributes } from 'src/backend/common/interfaces/session/ISessionAttributes';
import { User } from '../user/user.entity';
import IServiceOperationResponse from 'src/backend/common/interfaces/IServiceOperationResponse';
import ServiceOperationStatuses from 'src/backend/common/enums/ServiceOperationStatuses';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
  ) {}

  async handleRegistration(req: express.Request) {
    const registrationRequest: RegistrationRequest = Object.assign(new RegistrationRequest(), req.body);

    const errors = await validate(registrationRequest);

    if (errors.length > 0) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: Object.values(errors[0].constraints)[0]
      }
    }

    const user: User = await this.userService.create(registrationRequest)

    this.loginUser(req, user)

    return {status: ServiceOperationStatuses.SUCCESS}
  }

  async handleLogin(req: express.Request): Promise<IServiceOperationResponse> {

    const loginRequest: LoginRequest = Object.assign(new LoginRequest(), req.body);

    const errors = await validate(loginRequest);

    if (errors.length > 0) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: Object.values(errors[0].constraints)[0]
      }
    }

    const user: User = await this.userService.findByEmail(loginRequest.email);

    if (!user) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: 'User with such email does not exist.'
      }
    }

    const isValidPassword = await bcrypt.compare(loginRequest.password, user.password);

    if (!isValidPassword) {
      return {
        status: ServiceOperationStatuses.ERROR, errorMessage: 'Password mismatch.'
      }
    }

    this.loginUser(req, user);

    return { status: ServiceOperationStatuses.SUCCESS }
  }

  loginUser(req: express.Request, user: User) {
    const sessionData = req.session as ISessionAttributes;

    sessionData.user = user;
  }

  logoutUser(req: express.Request) {
    const sessionData = req.session as ISessionAttributes;

    sessionData.user = null
  }
}
