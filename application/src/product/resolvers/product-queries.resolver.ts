import { Args, Query, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';

import {
  ProductsPagination,
  ProductsPaginationArgs,
} from '../dto/products-pagination.dto';
import { ProductService } from '../product.service';

@Resolver()
export class ProductQueriesResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => ProductsPagination)
  public async productsPagination(
    @Viewer() viewer: Viewer,
    @Args() args: ProductsPaginationArgs,
  ) {
    return this.productService.getRootProductsPagination(viewer, args);
  }
}
