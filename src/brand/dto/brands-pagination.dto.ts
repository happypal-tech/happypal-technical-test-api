import { ArgsType, Field, ObjectType } from '@nestjs/graphql';

import { SelectQueryBuilder } from 'typeorm';

import { Edge } from '@/pagination/dto/edge.dto';
import { Pagination, PaginationArgs } from '@/pagination/dto/pagination.dto';

import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Brand } from '../models/brand.model';

@ObjectType({ implements: [Edge] })
export class BrandEdge extends Edge {
  @Field(() => Brand)
  node: Brand;
}

@ObjectType({ implements: [Pagination] })
export class BrandsPagination extends Pagination {
  @Field(() => [Brand])
  nodes: Brand[];

  @Field(() => [BrandEdge])
  edges: BrandEdge[];

  query: SelectQueryBuilder<Brand>;
}

@ArgsType()
export class BrandsPaginationArgs extends PaginationArgs {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  brandName?: String;
}
