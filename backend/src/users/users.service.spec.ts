import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashedpassword',
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashedpassword',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await usersService.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await usersService.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await usersService.findById('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(
        usersService.create('test@example.com', 'Test', 'hash'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
