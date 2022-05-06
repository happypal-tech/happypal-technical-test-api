import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GraphQLToHTTPFilter } from './filters/graphQLToHTTP.filter';

@Module({
  imports: [],
  providers: [{ provide: APP_FILTER, useClass: GraphQLToHTTPFilter }],
})
export class ErrorModule {}
