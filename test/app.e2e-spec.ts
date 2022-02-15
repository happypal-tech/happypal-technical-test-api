import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import request from 'supertest';
import { Repository } from 'typeorm';
import { Product } from '../src/product/models/product.model';
import { User } from '../src/user/models/user.model';
import { UserService } from '../src/user/user.service';

import { AppModule } from './../src/app.module';
import { seed } from './../src/seed/seed';

import { get as _get } from 'lodash';
import { ProductsPagination } from '../src/product/dto/products-pagination.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await seed();
  });

  describe('App', () => {
    test('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('User', () => {
    let userService: UserService;

    beforeAll(async () => {
      userService = app.get<UserService>(UserService);
    });

    test('Find by email and by id', async () => {
      const userFromEmail = await userService.findByEmail('user1@test.com', true);
      expect(userFromEmail).toBeDefined;

      if (userFromEmail != undefined) {
        const userFromId = await userService.findById(userFromEmail.id);

        expect(userFromId).toBeDefined;
        expect(userFromId.id).toBe(userFromEmail.id);
      }
    });
  });
  
  describe('Auth', () => {
    let userRepo: Repository<User>;
    let jwtService: JwtService;

    beforeAll(async () => {
      userRepo = app.get<Repository<User>>(getRepositoryToken(User));
      jwtService = app.get<JwtService>(JwtService);
    });

    test('/login (POST)', async () => {
      const user = await userRepo.findOne({where: { email : 'user1@test.com' } });
      expect(user).toBeDefined();

      if (user != undefined) {
        request(app.getHttpServer())
        .post('/auth/login')
        .send('email=user1@test.com&password=password')
        .expect((res) => {
          expect(res.body.accessToken).toEqual(
            jwtService.sign({
              sub: user.id,
              email: user.email,
              type: 'AccessToken',
            }, {
              expiresIn: 1000 * 60 * 10, // 10 minutes,
            }));
        });
      }
    });
  });

  describe('Product', () => {
    const gql = '/graphql';

    let productRepo: Repository<Product>;
    let authorization: string;

    beforeAll(async () => {
      productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
      authorization = await request(app.getHttpServer())
        .post('/auth/login')
        .send('email=user1@test.com&password=password')
        .then((res) => _get(res, 'body.accessToken'))
    });

    test(`${gql} product`, async () => {
      const product = await productRepo.findOne({where: { name: 'Voiture miniature' }});

      expect(product).toBeDefined
      if (product != null) {
        return request(app.getHttpServer())
        .post(gql)
        .auth(authorization, { type: "bearer" })     
        .send({ 
          query: `{
            product(productId: "${product.id}") {
              id
              owner {
                email
              }
            }
          }`
        })
        .expect((res) => {
          // Check owner relation
          expect(_get(res, 'body.data.product.owner.email')).toEqual('user1@test.com');
        });
      }
    });

    test(`${gql} product search`, async () => {
        return request(app.getHttpServer())
        .post(gql)
        .auth(authorization, { type: "bearer" })     
        .send({ 
          query: `{
            productsPagination(nameOrDescription: "vélo café") {
              nodes {
                id
                name
                description
                pictures {
                  id
                  mimetype
                }
                owner { id }
              }
              edges {
                cursor
                node {
                  name
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                pageCount
              }
              totalCount
            }
          }`
        })
        .expect((res) => {
          // Check pictures relation
          expect(_get(res, 'body.data.productsPagination.nodes[0].pictures')).toBeDefined();

          // Check searched term inside results to match total count
          expect(
            _get(res, 'body.data.productsPagination.nodes')
            .map((item: Product) => [_get(item, 'description', '').toLowerCase(), _get(item, 'name', '').toLowerCase()].join())
            .filter((str: string) => str.includes('vélo') || str.includes('café')).length
            ).toBe(res.body.data.productsPagination.totalCount);
        });
      
    });
  });

  afterAll(async () => {
    if (app != null) await app.close();
  });
});
