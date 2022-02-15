import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BadRequestError } from './error/errors/BadRequest.error';
import { flattenValidationErrors } from './error/utils/flattenValidationErrors';
import { GraphqlModule } from './graphql/graphql.module';
import { NodeModule } from './node/node.module';
import { TypeOrmConfigService } from './orm/type-orm-config.service';
import { PictureModule } from './picture/picture.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    UserModule,
    NodeModule,
    GraphqlModule,
    AuthModule,
    ProductModule,
    PictureModule,
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
