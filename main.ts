import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/backend/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { useContainer } from 'class-validator';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, './backend/common', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setViewEngine('hbs');

  useContainer(app, { fallbackOnErrors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(3000);
}

bootstrap();
