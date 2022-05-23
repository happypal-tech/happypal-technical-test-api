import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { SelectQueryBuilder } from 'typeorm';

import { Edge } from '@/pagination/dto/edge.dto';
import { Pagination, PaginationArgs } from '@/pagination/dto/pagination.dto';

import { Product } from '../models/product.model';
import { IsOptional } from 'class-validator';

@InputType()
export class PaginationFilters {
  @Field({ nullable: true })
  isAvailable: boolean;
}

@ObjectType({ implements: [Edge] })
export class ProductEdge extends Edge {
  @Field(() => Product)
  node: Product;
}

@ObjectType({ implements: [Pagination] })
export class ProductsPagination extends Pagination {
  @Field(() => [Product])
  nodes: Product[];

  @Field(() => [ProductEdge])
  edges: ProductEdge[];

  query: SelectQueryBuilder<Product>;

  @Field(() => Float, { nullable: true })
  priceAverage?: number;
}

@ArgsType()
export class ProductsPaginationArgs extends PaginationArgs {
  @Field(() => PaginationFilters, { nullable: true })
  @IsOptional()
  filter?: PaginationFilters;
}
