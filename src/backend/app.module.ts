import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HomeModule } from './features/home/home.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import typeorm from '../../ormconfig'
import { HandlebarsMiddleware } from './common/middlewares/handlebars.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './features/chat/chat.module';
import { isAuthenticatedMiddleware } from './common/middlewares/is-authenticated.middleware';
import { MessageModule } from './features/message/message.module';
import { OpenAIGPTModule } from './features/open-ai-gpt/open-ai-gpt.module';


@Module({
  imports: [HomeModule, 
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
    OpenAIGPTModule,
    ServeStaticModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HandlebarsMiddleware).forRoutes('*');
    consumer.apply(isAuthenticatedMiddleware).forRoutes('/chats', '/user');
    
  }
}
