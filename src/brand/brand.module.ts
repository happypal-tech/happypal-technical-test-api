import { ProductModule } from '@/product/product.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandService } from './brand.service';
import { Brand } from './models/brand.model';
import { BrandFieldsResolver } from './resolvers/brand-fields.resolver';
import { BrandMutationResolver } from './resolvers/brand-mutation.resolver';
import { BrandQueriesResolver } from './resolvers/brand-queries.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), ProductModule],
  providers: [BrandService, BrandQueriesResolver, BrandMutationResolver, BrandFieldsResolver],
  exports: [BrandService]
})
export class BrandModule { }
