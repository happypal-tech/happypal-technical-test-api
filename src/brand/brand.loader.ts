import { Viewer } from '@/auth/decorators/Viewer.decorator';
import DataLoader from 'dataloader';

import { BrandService } from './brand.service';
import { Brand } from './models/brand.model';

export function createBrandsLoader(brandService: BrandService) {
    return new DataLoader<string, Brand>(async (ids) => {
        const brands = await brandService.getBrandsByIds(null, ids);
        const brandMap: Record<string, Brand> = {};
        for (const brand of brands) {
            brandMap[brand.id] = brand;
        }
        return ids.map((id) => brandMap[id]);
    });
}