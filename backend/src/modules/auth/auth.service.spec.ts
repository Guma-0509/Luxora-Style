import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRATION') return '15m';
      if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'Juan',
          lastName: 'Pérez',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register a new user and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'CUSTOMER' });
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      const mockCreatedUser = {
        id: 'new-user-1',
        email: 'nuevo@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        status: UserStatus.ACTIVE,
        role: { name: 'CUSTOMER', permissions: [] },
      };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockPrismaService.refreshToken.create.mockResolvedValue({ id: 'token-1' });

      const result = await service.register({
        email: 'nuevo@example.com',
        password: 'Password123!',
        firstName: 'Juan',
        lastName: 'Pérez',
      });

      expect(result.user.email).toBe('nuevo@example.com');
      expect(result.accessToken).toBe('mocked-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'cliente@example.com',
        passwordHash: 'hashed-password',
        status: UserStatus.ACTIVE,
        role: { name: 'CUSTOMER', permissions: [] },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'cliente@example.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and user profile on successful authentication', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'cliente@example.com',
        passwordHash: 'hashed-password',
        status: UserStatus.ACTIVE,
        role: { name: 'CUSTOMER', permissions: [{ permission: { name: 'products:read' } }] },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({ id: 'ref-1' });

      const result = await service.login({
        email: 'cliente@example.com',
        password: 'CorrectPassword123!',
      });

      expect(result.accessToken).toBe('mocked-token');
      expect(result.user.email).toBe('cliente@example.com');
    });
  });
});
