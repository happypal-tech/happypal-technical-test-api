import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { Picture } from '@/picture/models/picture.model';

import { Product } from '../models/product.model';
import { ProductService } from '../product.service';

@Resolver(Product)
export class ProductFieldsResolver {
  constructor(private readonly productService: ProductService) {}

  @ResolveField(() => [Picture])
  pictures(@Viewer() viewer: Viewer, @Parent() parent: Product) {
    return this.productService.getProductPictures(viewer, parent);
  }
}
