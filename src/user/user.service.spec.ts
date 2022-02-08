import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';

import { User } from './models/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('Testing getSearchableEmail()', () => {
    expect(service.getSearchableEmail('  AA.BB@TEST.COM ')).toBe(
      'aa.bb@test.com',
    );
  });
});
