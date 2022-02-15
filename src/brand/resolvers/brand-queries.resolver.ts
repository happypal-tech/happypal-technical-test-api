import { Public } from '@/auth/decorators/Public.decorator';
import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { BrandService } from '../brand.service';
import { BrandsPagination, BrandsPaginationArgs } from '../dto/brands-pagination.dto';
import { Brand } from '../models/brand.model';

@Resolver()
export class BrandQueriesResolver {
    constructor(private readonly brandService: BrandService) { }

    @Public()
    @Query(() => BrandsPagination)
    public async brandsPagination(
        @Viewer() viewer: Viewer,
        @Args() args: BrandsPaginationArgs,
    ) {
        return this.brandService.getRootBrandsPagination(viewer, args);
    }

    @Public()
    @Query(() => Brand, { name: "brand" })
    public async getBrand(
        @Viewer() viewer: Viewer,
        @Args('brandId') brandId: String,
    ): Promise<Brand | undefined> {
        return this.brandService.getRootBrand(viewer, brandId as Brand['id']);
    }
}
