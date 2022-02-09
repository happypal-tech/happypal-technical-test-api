import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/user/models/user.model';
import { UserService } from '../src/user/user.service';

import { AppModule } from './../src/app.module';
import { seed } from './../src/seed/seed';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    //await seed();
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

  afterAll(async () => {
    if (app != null) await app.close();
  });
});
