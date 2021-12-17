import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { CurrencyScalar } from './scalars/currency.scalar';

@Module({
  imports: [
    GraphQLModule.forRoot({
      introspection: true,
      playground: true,
      autoTransformHttpErrors: true,
      autoSchemaFile: true,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      sortSchema: true,
      path: '/graphql',
    }),
  ],
  providers: [CurrencyScalar],
})
export class GraphqlModule {}
