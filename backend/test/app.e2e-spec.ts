import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { ProtectedModule } from '../src/protected/protected.module';

describe('Auth & Protected Endpoints (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let accessToken: string;

  const testUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'Password1!',
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              JWT_EXPIRES_IN: '1h',
              BCRYPT_SALT_ROUNDS: 10,
            }),
          ],
        }),
        MongooseModule.forRoot(mongoUri),
        AuthModule,
        UsersModule,
        ProtectedModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(409);
    });

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);
    });

    it('should reject short name', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...testUser, email: 'new@example.com', name: 'AB' })
        .expect(400);
    });

    it('should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...testUser, email: 'new2@example.com', password: '12345678' })
        .expect(400);
    });
  });

  describe('POST /auth/signin', () => {
    it('should sign in existing user and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      accessToken = response.body.accessToken;
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: testUser.email, password: 'WrongPass1!' })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'nonexistent@example.com', password: 'Password1!' })
        .expect(401);
    });
  });

  describe('GET /protected/welcome', () => {
    it('should return welcome message for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/protected/welcome')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Welcome to the application');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/protected/welcome')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/protected/welcome')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /protected/me', () => {
    it('should return user profile for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/protected/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('name', testUser.name);
    });
  });
});
