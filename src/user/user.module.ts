import { Module } from '@nestjs/common';

import { ProductModule } from '@/product/product.module';

import { UserFieldsResolver } from './resolvers/user.fields.resolver';
import { UserQueriesResolver } from './resolvers/user.queries.resolver';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { UserMutationResolver } from './resolvers/user-mutation.resolver';

@Module({
  imports: [ProductModule, TypeOrmModule.forFeature([User]), AuthModule],
  providers: [UserService, UserQueriesResolver, UserFieldsResolver, UserMutationResolver],
  exports: [UserService],
})
export class UserModule { }
