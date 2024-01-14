import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from "@nestjs/passport"

@Module({
  imports: [
    UserModule, 
    TypeOrmModule.forFeature([User]),
    PassportModule, JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '60m' },
    })],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, PassportModule, JwtModule]
})
export class AuthModule {}
