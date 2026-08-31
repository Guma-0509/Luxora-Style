import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovementType } from '@prisma/client';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    productVariant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adjustStock', () => {
    const mockVariant = {
      id: 'var-1',
      sku: 'IPH-15-256-BLK',
      title: '256GB - Titanium Black',
      stock: 15,
      product: { name: 'iPhone 15 Pro Max' },
    };

    it('should successfully add stock and create an immutable movement record', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaService.productVariant.update.mockResolvedValue({
        ...mockVariant,
        stock: 25,
      });
      mockPrismaService.inventoryMovement.create.mockResolvedValue({
        id: 'mov-1',
        newStock: 25,
        user: { email: 'admin@wallystore.com', firstName: 'Admin', lastName: 'User' },
      });

      const result = await service.adjustStock(
        {
          variantId: 'var-1',
          quantityModified: 10,
          type: MovementType.PURCHASE,
          reason: 'Lote nuevo recibido',
        },
        'admin-user-id',
      );

      expect(mockPrismaService.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stock: 25 },
      });
      expect(mockPrismaService.inventoryMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variantId: 'var-1',
          previousStock: 15,
          quantityModified: 10,
          newStock: 25,
          type: MovementType.PURCHASE,
        }),
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      });
      expect(result.variant.stock).toBe(25);
    });

    it('should throw BadRequestException if adjustment causes negative stock', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(mockVariant);

      await expect(
        service.adjustStock(
          {
            variantId: 'var-1',
            quantityModified: -20, // 15 - 20 = -5 (invalid)
            type: MovementType.DAMAGED,
            reason: 'Merma',
          },
          'admin-user-id',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if variant does not exist', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.adjustStock(
          { variantId: 'non-existent', quantityModified: 5, type: MovementType.ADJUSTMENT, reason: 'Test' },
          'admin-user-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
