import { Module } from '@nestjs/common';

import { ProductModule } from '@/product/product.module';

import { UserFieldsResolver } from './resolvers/user.fields.resolver';
import { UserQueriesResolver } from './resolvers/user.queries.resolver';
import { UserService } from './user.service';

@Module({
  imports: [ProductModule],
  providers: [UserService, UserQueriesResolver, UserFieldsResolver],
  exports: [UserService],
})
export class UserModule {}
