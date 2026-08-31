import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CouponType } from '@prisma/client';

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    coupon: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCoupon', () => {
    const validCoupon = {
      id: 'coupon-1',
      code: 'BIENVENIDO10',
      description: '10% off',
      type: CouponType.PERCENTAGE,
      value: 10,
      minSpend: 50,
      maxDiscount: 100,
      maxUsageTotal: 1000,
      currentUsageCount: 5,
      maxUsagePerUser: 1,
      startDate: new Date(Date.now() - 86400000), // Ayer
      endDate: new Date(Date.now() + 86400000 * 30), // En 30 días
      isActive: true,
    };

    it('should successfully validate a percentage coupon and calculate discount', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(validCoupon);
      mockPrismaService.order.count.mockResolvedValue(0);

      const result = await service.validateCoupon(
        { code: 'BIENVENIDO10', subtotal: 200 },
        'user-123',
      );

      expect(result.valid).toBe(true);
      expect(result.code).toBe('BIENVENIDO10');
      expect(result.discountAmount).toBe(20); // 10% of 200
    });

    it('should cap discount amount at maxDiscount if exceeded', async () => {
      const couponWithCap = {
        ...validCoupon,
        value: 50, // 50%
        maxDiscount: 40,
      };
      mockPrismaService.coupon.findUnique.mockResolvedValue(couponWithCap);
      mockPrismaService.order.count.mockResolvedValue(0);

      const result = await service.validateCoupon({ code: 'BIENVENIDO10', subtotal: 200 });

      expect(result.discountAmount).toBe(40);
    });

    it('should throw BadRequestException if coupon is inactive or not found', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.validateCoupon({ code: 'INEXISTENTE', subtotal: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if subtotal is less than minSpend', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(validCoupon);

      await expect(
        service.validateCoupon({ code: 'BIENVENIDO10', subtotal: 30 }), // minSpend is 50
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if coupon is expired', async () => {
      const expiredCoupon = {
        ...validCoupon,
        endDate: new Date(Date.now() - 86400000), // Ayer
      };
      mockPrismaService.coupon.findUnique.mockResolvedValue(expiredCoupon);

      await expect(
        service.validateCoupon({ code: 'BIENVENIDO10', subtotal: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if max usage limit per user is reached', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(validCoupon);
      mockPrismaService.order.count.mockResolvedValue(1); // User already used it 1 time

      await expect(
        service.validateCoupon({ code: 'BIENVENIDO10', subtotal: 100 }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
