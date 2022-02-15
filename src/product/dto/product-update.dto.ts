import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { Product } from '../models/product.model';
import { ProductCreateInput } from './product-create.dto';

@InputType()
export class ProductUpdateInput extends PartialType(ProductCreateInput) {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: Product['id'];
}

@ObjectType()
export class ProductUpdateOutput {
  @Field(() => Product)
  product: Product;
}
