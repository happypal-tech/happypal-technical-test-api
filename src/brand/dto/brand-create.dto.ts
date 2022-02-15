import { Field, InputType, ObjectType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


import { Brand } from '../models/brand.model';

@InputType()
export class BrandCreateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;
}

@ObjectType()
export class BrandCreateOutput {
  @Field(() => Brand)
  brand: Brand;
}
