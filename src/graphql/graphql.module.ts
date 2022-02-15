import { createBrandsLoader } from '@/brand/brand.loader';
import { BrandModule } from '@/brand/brand.module';
import { BrandService } from '@/brand/brand.service';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { CurrencyScalar } from './scalars/currency.scalar';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [BrandModule],
      useFactory: (brandService: BrandService) => ({
        introspection: true,
        playground: true,
        autoTransformHttpErrors: true,
        autoSchemaFile: true,
        buildSchemaOptions: {
          numberScalarMode: 'integer',
        },
        sortSchema: true,
        path: '/graphql',
        context: () => ({
          brandsLoader: createBrandsLoader(brandService)
        })
      }),
      inject: [BrandService]
    }),
  ],
  providers: [CurrencyScalar],
})
export class GraphqlModule { }
