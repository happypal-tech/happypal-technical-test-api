import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { PaginationService } from '@/pagination/pagination.service';
import { Role } from '@/user/enums/role.enum';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandCreateInput, BrandCreateOutput } from './dto/brand-create.dto';
import { BrandUpdateInput, BrandUpdateOutput } from './dto/brand-update.dto';
import { BrandsPagination, BrandsPaginationArgs } from './dto/brands-pagination.dto';
import { Brand } from './models/brand.model';

@Injectable()
export class BrandService {
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepo: Repository<Brand>,
    ) { }


    /**
     * QUERIES
     */
    public async getRootBrand(
        viewer: Viewer,
        brandId: Brand['id'],
    ): Promise<Brand | undefined> {
        const query = await this.generateBrandQuery(viewer, 'brand');

        return query
            .andWhere('brand.id = :brandId')
            .setParameters({ brandId })
            .getOne();
    }

    public async getRootBrandsPagination(
        viewer: Viewer,
        args: BrandsPaginationArgs,
    ): Promise<BrandsPagination> {
        const query = await this.generateBrandFilteredQuery(viewer, args, 'brand');

        return PaginationService.generatePaginationOutput(
            query,
            args,
            (entity) => ({ node: entity }),
        );
    }

    public async getBrandsByIds(viewer: Viewer, ids: readonly string[]): Promise<Brand[]> {
        console.log(ids)
        const query = await this.generateBrandQuery(viewer, 'brand');

        return query.whereInIds(ids).getMany();
    }

    /**
     * Mutations
     */

    public async brandCreate(
        viewer: Viewer,
        input: BrandCreateInput,
    ): Promise<BrandCreateOutput> {
        if (!viewer) {
            throw new UnauthorizedException();
        }

        if (viewer.role !== Role.Admin) {
            throw new ForbiddenException();
        }

        const brand = new Brand({
            name: input.name.trim()
        })

        await this.brandRepo.save(brand);

        return { brand }

    }

    public async brandUpdate(
        viewer: Viewer,
        input: BrandUpdateInput,
    ): Promise<BrandUpdateOutput> {
        if (!viewer) {
            throw new UnauthorizedException();
        }

        if (viewer.role !== Role.Admin) {
            throw new ForbiddenException();
        }

        const brand = await this.brandRepo.preload({ ...input });
        if (!brand) {
            throw new NotFoundException();
        }

        await this.brandRepo.save(brand);

        return { brand };
    }

    /**
     * UTILS
     */

    public async generateBrandQuery(viewer: Viewer, alias = 'brand') {
        const query = this.brandRepo.createQueryBuilder(alias);

        return query;
    }

    public async generateBrandFilteredQuery(
        viewer: Viewer,
        args: BrandsPaginationArgs,
        alias = 'brand',
    ) {
        const query = await this.generateBrandQuery(viewer, alias);

        if (args.brandName) {
            query.andWhere("LOWER(brand.name) like :name", { name: `%${args.brandName.toLowerCase()}%` })
        }

        return query;
    }
}
