import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BadRequestError } from './error/errors/BadRequest.error';
import { flattenValidationErrors } from './error/utils/flattenValidationErrors';
import { GraphqlModule } from './graphql/graphql.module';
import { NodeModule } from './node/node.module';
import { PaginationModule } from './pagination/pagination.module';
import { PictureModule } from './picture/picture.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      database: 'happypal_technical_test',
      username: 'hpal',
      password: 'hpal',
      entities: [path.join(__dirname, '**/*.model{.ts,.js}')],
      migrations: [path.join(__dirname, 'migrations/**{.ts,.js}')],
      synchronize: true,
    }),
    UserModule,
    NodeModule,
    GraphqlModule,
    AuthModule,
    ProductModule,
    PaginationModule,
    PictureModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        whitelist: true,
        exceptionFactory: (errors) => {
          throw new BadRequestError('validation-error', {
            fields: flattenValidationErrors(errors),
          });
        },
      }),
    },
  ],
})
export class AppModule {}
