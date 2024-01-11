import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { EmailExistsValidator } from './validators/email-exists';
import { EmailDoesNotExistValidator } from './validators/email-does-not-exist';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, EmailExistsValidator, EmailDoesNotExistValidator],
  exports: [UserService, EmailExistsValidator, EmailDoesNotExistValidator]
})
export class UserModule {}
