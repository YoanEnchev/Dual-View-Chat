import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service'; // Replace with the actual service for user management

@ValidatorConstraint({ name: 'emailDoesNotExist', async: true })
@Injectable()
export class EmailDoesNotExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string, _args: ValidationArguments) {
    const user = await this.userService.findByEmail(email);
    
    return !user;
  }
}