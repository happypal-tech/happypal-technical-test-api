import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { PaginationService } from '@/pagination/pagination.service';
import { Picture } from '@/picture/models/picture.model';
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

@Injectable()
export class ProductService extends PaginationService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly pictureService: PictureService,
  ) {
    super();
  }

  /**
   * SELF RESOLVERS
   */
  public async getProductPictures(
    viewer: Viewer,
    parent: Product,
  ): Promise<Picture[]> {
    const query = this.generateProductQuery(viewer);

    return query.relation('pictures').of(parent).loadMany<Picture>();
  }

  /**
   * EXTERNAL RESOLVERS
   */
  public async getUserOwnedProductsPagination(
    viewer: Viewer,
    parent: User,
    args: ProductsPaginationArgs,
  ): Promise<ProductsPagination> {
    const query = this.generateProductFilteredQuery(viewer, args);

    query
      .innerJoin('product.owner', 'owner')
      .where('owner.id = :parentId')
      .setParameters({ parentId: parent.id });

    return this.generatePaginationOutput(query, args, (entity) => ({
      node: entity,
    }));
  }

  /**
   * QUERIES
   */
  public async getRootProduct(
    viewer: Viewer,
    productId: Product['id'],
  ): Promise<Product> {
    const query = this.generateProductQuery(viewer);

    return query
      .innerJoinAndSelect('product.owner', 'owner')
      .andWhere('product.id = :productId')
      .setParameters({ productId })
      .getOneOrFail();
  }

  public async getRootProductsPagination(
    viewer: Viewer,
    args: ProductsPaginationArgs,
  ): Promise<ProductsPagination> {
    const query = this.generateProductFilteredQuery(viewer, args);
    query.innerJoinAndSelect('product.owner', 'owner');

    return this.generatePaginationOutput(query, args, (entity) => ({
      node: entity,
    }));
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

    const picturesQuery = this.pictureService.generatePictureQuery(
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
   * UTILS
   */

  public generateProductQuery(viewer: Viewer, alias = 'product') {
    const query = this.productRepo.createQueryBuilder(alias);

    return query;
  }

  public generateProductFilteredQuery(
    viewer: Viewer,
    args: ProductsPaginationArgs,
    alias = 'product',
  ) {
    const query = this.generateProductQuery(viewer, alias);

    if (args.nameOrDescription) {
      query.andWhere(
        "to_tsvector(product.name || ' ' || product.description) @@ to_tsquery(:nameOrDescription)",
        { nameOrDescription: args.nameOrDescription.split(' ').join('|') },
      );
    }

    return query;
  }
}
