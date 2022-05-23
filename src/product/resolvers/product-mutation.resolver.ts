import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';

import {
  ProductCreateInput,
  ProductCreateOutput,
} from '../dto/product-create.dto';
import { ProductService } from '../product.service';
import {
  ProductAvaibilityInput,
  ProductAvaibilityOutput,
} from '../dto/product-avaibility.dto';

@Resolver()
export class ProductMutationResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => ProductCreateOutput)
  productCreate(
    @Viewer() viewer: Viewer,
    @Args('input') input: ProductCreateInput,
  ) {
    return this.productService.productCreate(viewer, input);
  }

  @Mutation(() => ProductAvaibilityOutput)
  changeProductAvaibility(
    @Viewer() viewer: Viewer,
    @Args('input') input: ProductAvaibilityInput,
  ) {
    return this.productService.updateProductAvaibility(viewer, input);
  }
}
