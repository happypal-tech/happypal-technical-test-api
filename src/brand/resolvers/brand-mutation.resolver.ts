import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BrandService } from '../brand.service';
import { BrandCreateInput, BrandCreateOutput } from '../dto/brand-create.dto';
import { BrandUpdateInput, BrandUpdateOutput } from '../dto/brand-update.dto';

@Resolver()
export class BrandMutationResolver {
    constructor(private readonly brandService: BrandService) { }

    @Mutation(() => BrandCreateOutput)
    productCreate(
        @Viewer() viewer: Viewer,
        @Args('input') input: BrandCreateInput,
    ) {
        return this.brandService.brandCreate(viewer, input);
    }

    @Mutation(() => BrandUpdateOutput)
    productUpdate(
        @Viewer() viewer: Viewer,
        @Args('input') input: BrandUpdateInput,
    ) {
        return this.brandService.brandUpdate(viewer, input);
    }
}
