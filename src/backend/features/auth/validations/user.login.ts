import { MaxLength, MinLength, Validate } from 'class-validator';
import { EmailExistsValidator } from '../../user/validators/email-exists';

export class LoginRequest {

    @Validate(EmailExistsValidator, {
        message: 'No user with such email exists.',
    })
    email: string;

    @MinLength(6, {
      message: 'Password must be at least 6 symbols.',
    })
    @MaxLength(50, {
      message: 'Password must be below 50 symbols.',
    })
    password: string;
}