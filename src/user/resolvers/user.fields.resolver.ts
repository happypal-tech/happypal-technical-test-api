import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';
import {
  ProductsPagination,
  ProductsPaginationArgs,
} from '@/product/dto/products-pagination.dto';
import { ProductService } from '@/product/product.service';

import { User } from '../models/user.model';

@Resolver(User)
export class UserFieldsResolver {
  constructor(private readonly productService: ProductService) {}

  @ResolveField(() => ProductsPagination)
  ownedProductsPagination(
    @Viewer() viewer: Viewer,
    @Parent() parent: User,
    @Args() args: ProductsPaginationArgs,
  ) {
    return this.productService.getUserOwnedProductsPagination(
      viewer,
      parent,
      args,
    );
  }
}
