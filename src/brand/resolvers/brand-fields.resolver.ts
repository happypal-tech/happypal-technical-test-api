import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';

import { ProductsPagination, ProductsPaginationArgs } from '@/product/dto/products-pagination.dto';
import { Brand } from '../models/brand.model';
import { ProductService } from '@/product/product.service';

@Resolver(Brand)
export class BrandFieldsResolver {
  constructor(private readonly productService: ProductService) { }

  @ResolveField(() => ProductsPagination)
  ownedProductsPagination(
    @Viewer() viewer: Viewer,
    @Parent() parent: Brand,
    @Args() args: ProductsPaginationArgs,
  ) {
    return this.productService.getBrandProductsPagination(
      viewer,
      parent,
      args,
    );
  }
}
