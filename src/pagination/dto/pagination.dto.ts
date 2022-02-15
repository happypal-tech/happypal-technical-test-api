import {
  ArgsType,
  Field,
  Int,
  InterfaceType,
  ObjectType,
} from '@nestjs/graphql';

import { IsOptional, Max, Min } from 'class-validator';
import { SelectQueryBuilder } from 'typeorm';

import { Node } from '@/node/models/node.model';

import { Edge } from './edge.dto';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true })
  @Min(0)
  @Max(50)
  @IsOptional()
  take?: number = 50;

  @Field(() => Int, { nullable: true })
  @Min(0)
  @IsOptional()
  skip?: number = 0;
}

@ObjectType()
export class PaginationPageInfo {
  @Field()
  pageCount: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@InterfaceType()
export abstract class Pagination<
  N extends Node = Node,
  E extends Edge<N> = Edge<N>,
  > {
  @Field()
  totalCount: number;

  @Field(() => PaginationPageInfo)
  pageInfo: PaginationPageInfo;

  @Field(() => [Edge])
  edges: E[];

  @Field(() => [Node])
  nodes: N[];

  query: SelectQueryBuilder<N>;
}

@ObjectType()
export class PaginationEnumFilter {
  @Field(() => String, { nullable: true })
  value?: any;

  @Field(() => Int)
  count: number;
}
