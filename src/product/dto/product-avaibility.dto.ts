import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Product } from '../models/product.model';

// input must have an id of a product and a boolean to make available the product (true) or not (false)
@InputType()
export class ProductAvaibilityInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;
}

@ObjectType()
export class ProductAvaibilityOutput {
  @Field(() => Product)
  product: Product;
}
