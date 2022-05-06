import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PictureModule } from '@/picture/picture.module';

import { Product } from './models/product.model';
import { ProductService } from './product.service';
import { ProductFieldsResolver } from './resolvers/product-fields.resolver';
import { ProductMutationResolver } from './resolvers/product-mutation.resolver';
import { ProductQueriesResolver } from './resolvers/product-queries.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), PictureModule],
  providers: [
    ProductService,
    ProductFieldsResolver,
    ProductQueriesResolver,
    ProductMutationResolver,
  ],
  exports: [ProductService],
})
export class ProductModule {}
