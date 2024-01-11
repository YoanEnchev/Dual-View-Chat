import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';


@ValidatorConstraint({ name: 'emailExists', async: true })
@Injectable()
export class EmailExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService,) {}

  async validate(email: string, _args: ValidationArguments) {

    const user = await this.userService.findByEmail(email);
    
    return !!user;
  }
}