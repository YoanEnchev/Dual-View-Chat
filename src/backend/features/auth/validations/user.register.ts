import { IsEmail, MaxLength, MinLength, Validate } from 'class-validator';
import { EmailDoesNotExistValidator } from '../../user/validators/email-does-not-exist';

export class RegistrationRequest {
    @IsEmail(
        // No need for custom message. It's expected for the client to handle it.
    )
    @Validate(EmailDoesNotExistValidator, {
        message: 'Email is already taken.',
    })
    email: string;

    @MinLength(2, {
      message: 'First name must be at least 2 symbols.',
    })
    @MaxLength(50, {
      message: 'First name must be below 50 symbols.',
    })
    firstName: string;


    @MinLength(2, {
      message: 'First name must be at least 2 symbols.',
    })
    @MaxLength(50, {
      message: 'First name must be below 50 symbols.',
    })
    lastName: string;


    @MinLength(6, {
      message: 'Password must be at least 6 symbols.',
    })
    @MaxLength(50, {
      message: 'Password must be below 50 symbols.',
    })
    password: string;
}