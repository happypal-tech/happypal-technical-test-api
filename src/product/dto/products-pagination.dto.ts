import { ArgsType, Field, ObjectType } from '@nestjs/graphql';

import { SelectQueryBuilder } from 'typeorm';

import { Edge } from '@/pagination/dto/edge.dto';
import { Pagination, PaginationArgs } from '@/pagination/dto/pagination.dto';

import { Product } from '../models/product.model';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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
}

@ArgsType()
export class ProductsPaginationArgs extends PaginationArgs {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  productName?: String;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsUUID()
  ownerId?: String;
}
