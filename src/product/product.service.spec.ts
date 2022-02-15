import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';

import { PictureService } from '@/picture/picture.service';

import { Product } from './models/product.model';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMock<Repository<Product>>(),
        },
        {
          provide: PictureService,
          useValue: createMock<PictureService>(),
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });
});
