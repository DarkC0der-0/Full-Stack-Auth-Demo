import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$hashedpassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(10),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      usersService.create.mockResolvedValue(mockUser as any);

      const result = await authService.signup({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password1!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(usersService.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password1!', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      } as any);

      const result = await authService.signin({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.signin({
          email: 'nonexistent@example.com',
          password: 'Password1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(
        authService.signin({
          email: 'test@example.com',
          password: 'WrongPassword1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid ID', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await authService.validateUser('507f1f77bcf86cd799439011');

      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should throw UnauthorizedException for invalid ID', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        authService.validateUser('invalid-id'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
