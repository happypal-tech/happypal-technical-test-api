import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductModule } from '@/product/product.module';

import { User } from './models/user.model';
import { UserFieldsResolver } from './resolvers/user.fields.resolver';
import { UserQueriesResolver } from './resolvers/user.queries.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ProductModule],
  providers: [UserService, UserQueriesResolver, UserFieldsResolver],
  exports: [UserService],
})
export class UserModule {}
