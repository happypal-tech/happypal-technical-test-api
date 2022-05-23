import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { Currency } from 'dinero.js';

import { CurrencyScalar } from '@/graphql/scalars/currency.scalar';

import { Product } from '../models/product.model';

@InputType()
export class ProductCreateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  pictureIds: string[];

  @Field()
  @IsNumber()
  @IsPositive()
  priceValue: number;

  @Field(() => CurrencyScalar)
  @IsString()
  priceCurrency: Currency;
  
  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean
}

@ObjectType()
export class ProductCreateOutput {
  @Field(() => Product)
  product: Product;
}
