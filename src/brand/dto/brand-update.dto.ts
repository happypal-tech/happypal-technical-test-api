import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { Brand } from '../models/brand.model';
import { BrandCreateInput } from './brand-create.dto';

@InputType()
export class BrandUpdateInput extends PartialType(BrandCreateInput) {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: Brand['id'];
}

@ObjectType()
export class BrandUpdateOutput {
  @Field(() => Brand)
  brand: Brand;
}
