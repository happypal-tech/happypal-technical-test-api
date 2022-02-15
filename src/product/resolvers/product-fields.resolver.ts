import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { Picture } from '@/picture/models/picture.model';

import { Product } from '../models/product.model';
import { ProductService } from '../product.service';
import { User } from '@/user/models/user.model';
import { Brand } from '@/brand/models/brand.model';
import DataLoader from 'dataloader';

@Resolver(Product)
export class ProductFieldsResolver {
  constructor(private readonly productService: ProductService) { }

  @ResolveField(() => [Picture])
  async pictures(@Viewer() viewer: Viewer, @Parent() parent: Product) {
    return this.productService.getProductPictures(viewer, parent);
  }

  @ResolveField(() => User)
  async owner(@Viewer() viewer: Viewer, @Parent() parent: Product) {
    return this.productService.getProductOwner(viewer, parent);
  }

  @ResolveField('brand', () => Brand, { nullable: true })
  getBrand(
    @Viewer() viewer: Viewer,
    @Parent() parent: Product,
    @Context('brandsLoader') brandsLoader: DataLoader<string, Brand>,
  ) {
    const { brandId } = parent;
    if (!brandId)
      return null;

    return brandsLoader.load(brandId);
  }
}
