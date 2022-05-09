import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { PaginationService } from '@/pagination/pagination.service';
import { PictureService } from '@/picture/picture.service';
import { User } from '@/user/models/user.model';

import {
  ProductCreateInput,
  ProductCreateOutput,
} from './dto/product-create.dto';
import {
  ProductsPagination,
  ProductsPaginationArgs,
} from './dto/products-pagination.dto';
import { Product } from './models/product.model';
import {
  ProductAvaibilityInput,
  ProductAvaibilityOutput,
} from './dto/product-avaibility.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly pictureService: PictureService,
  ) {}

  /**
   * SELF RESOLVERS
   */
  public async getProductPictures(viewer: Viewer, parent: Product) {
    return this.productRepo
      .createQueryBuilder('product')
      .where('product.id = :productId')
      .relation(Product, 'pictures')
      .of(parent)
      .loadMany();
  }

  /**
   * EXTERNAL RESOLVERS
   */
  public async getUserOwnedProductsPagination(
    viewer: Viewer,
    parent: User,
    args: ProductsPaginationArgs,
  ): Promise<ProductsPagination> {
    const query = await this.generateProductFilteredQuery(
      viewer,
      args,
      'product',
    );

    query
      .innerJoin('product.owner', 'owner')
      .where('owner.id = :parentId')
      .setParameters({ parentId: parent.id });

    return PaginationService.generatePaginationOutput(
      query,
      args,
      (entity) => ({ node: entity }),
    );
  }

  /**
   * QUERIES
   */
  public async getRootProduct(
    viewer: Viewer,
    productId: Product['id'],
  ): Promise<Product | undefined> {
    const query = await this.generateProductQuery(viewer, 'product');

    return query
      .andWhere('product.id = :productId')
      .setParameters({ productId })
      .getOne();
  }

  public async getRootProductsPagination(
    viewer: Viewer,
    args: ProductsPaginationArgs,
  ): Promise<ProductsPagination> {
    const query = await this.generateProductQuery(viewer, 'product');

    return PaginationService.generatePaginationOutput(
      query,
      args,
      (entity) => ({ node: entity }),
    );
  }

  /**
   * MUTATIONS
   */

  public async productCreate(
    viewer: Viewer,
    input: ProductCreateInput,
  ): Promise<ProductCreateOutput> {
    if (!viewer) {
      throw new UnauthorizedException();
    }

    const picturesQuery = await this.pictureService.generatePictureQuery(
      viewer,
      'picture',
    );

    const pictures = await picturesQuery
      .andWhere('picture.id IN (:...pictureIds)')
      .setParameters({ pictureIds: input.pictureIds })
      .getMany();

    if (pictures.length !== input.pictureIds.length) {
      throw new BadRequestException(
        `Missing pictures: [${input.pictureIds
          .filter((id) => !pictures.find((p) => p.id === id))
          .join(', ')}]`,
      );
    }

    const product = new Product({
      name: input.name.trim(),
      description: input.description?.trim(),
      owner: viewer,
      priceCurrency: input.priceCurrency,
      priceValue: input.priceValue,
      pictures,
    });

    await this.productRepo.save(product);

    return { product };
  }

  /**
   * Mutation to change availability of a product
   * @param viewer - user token
   * @param input - object with 2 props : id (string) and isAvailable (boolean) of a product
   * @returns - Promise with a product when resolved
   */

  public async updateProductAvaibility(
    viewer: Viewer,
    input: ProductAvaibilityInput,
  ): Promise<ProductAvaibilityOutput> {
    if (!viewer) {
      throw new UnauthorizedException();
    }

    const query = await this.generateProductUpdate()
      .set({ isAvailable: input.isAvailable })
      .where('id = :id', { id: input.id })
      .returning('id, name, "isAvailable"')
      .execute();

    return { product: query.raw[0] };
  }

  /**
   * UTILS
   */

  public async generateProductQuery(viewer: Viewer, alias = 'product') {
    const query = this.productRepo.createQueryBuilder(alias);

    return query;
  }

  // generate an update query for a product
  public generateProductUpdate() {
    return this.productRepo.createQueryBuilder().update(Product);
  }

  public async generateProductFilteredQuery(
    viewer: Viewer,
    args: ProductsPaginationArgs,
    alias = 'product',
  ) {
    const query = await this.generateProductQuery(viewer, alias);

    return query;
  }
}
