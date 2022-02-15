import { Args, Query, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';

import {
  ProductsPagination,
  ProductsPaginationArgs,
} from '../dto/products-pagination.dto';
import { ProductService } from '../product.service';
import { Product } from '../models/product.model';
import { Public } from '@/auth/decorators/Public.decorator';

@Resolver()
export class ProductQueriesResolver {
  constructor(private readonly productService: ProductService) { }

  @Public()
  @Query(() => ProductsPagination)
  public async productsPagination(
    @Viewer() viewer: Viewer,
    @Args() args: ProductsPaginationArgs,
  ) {
    return this.productService.getRootProductsPagination(viewer, args);
  }

  @Public()
  @Query(() => Product, { name: "product" })
  public async getProduct(
    @Viewer() viewer: Viewer,
    @Args('productId') productId: String,
  ): Promise<Product | undefined> {
    return this.productService.getRootProduct(viewer, productId as Product['id']);
  }

  @Query(() => ProductsPagination, { name: "myproducts" })
  public async getMyProducts(
    @Viewer() viewer: Viewer,
    @Args() args: ProductsPaginationArgs,
  ) {
    args.ownerId = viewer?.id;
    return this.productService.getRootProductsPagination(viewer, args);
  }
}
