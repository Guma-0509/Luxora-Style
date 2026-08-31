import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const validOrderStatuses = { notIn: ['CANCELLED' as const, 'REFUNDED' as const] };

    const [
      totalRevenueAgg,
      todayRevenueAgg,
      monthRevenueAgg,
      totalOrders,
      totalItemsSoldAgg,
      totalCustomers,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      // 1. Total Revenue
      this.prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { status: validOrderStatuses },
      }),
      // 2. Today's Revenue
      this.prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: {
          status: validOrderStatuses,
          createdAt: { gte: startOfToday },
        },
      }),
      // 3. Month's Revenue
      this.prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: {
          status: validOrderStatuses,
          createdAt: { gte: startOfMonth },
        },
      }),
      // 4. Total Orders
      this.prisma.order.count(),
      // 5. Total Products Sold
      this.prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: { order: { status: validOrderStatuses } },
      }),
      // 6. Registered Customers
      this.prisma.user.count({
        where: { role: { name: 'CUSTOMER' }, deletedAt: null },
      }),
      // 7. Low Stock Variants (<= 5)
      this.prisma.productVariant.count({
        where: { stock: { gt: 0, lte: 5 }, product: { deletedAt: null } },
      }),
      // 8. Out of Stock Variants (= 0)
      this.prisma.productVariant.count({
        where: { stock: 0, product: { deletedAt: null } },
      }),
    ]);

    return {
      totalRevenue: Number(totalRevenueAgg._sum.grandTotal || 0),
      todayRevenue: Number(todayRevenueAgg._sum.grandTotal || 0),
      monthRevenue: Number(monthRevenueAgg._sum.grandTotal || 0),
      totalOrders,
      totalItemsSold: totalItemsSoldAgg._sum.quantity || 0,
      totalCustomers,
      lowStockCount,
      outOfStockCount,
    };
  }

  async getSalesChart(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      select: {
        grandTotal: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por día
    const dailyMap: Record<string, { date: string; sales: number; count: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { date: key, sales: 0, count: 0 };
    }

    orders.forEach((ord) => {
      const key = ord.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) {
        dailyMap[key].sales += Number(ord.grandTotal);
        dailyMap[key].count += 1;
      }
    });

    return Object.values(dailyMap).map((d) => ({
      date: d.date,
      sales: Number(d.sales.toFixed(2)),
      count: d.count,
    }));
  }

  async getTopSellingProducts(limit: number = 5) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productName', 'variantTitle'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    return items.map((i) => ({
      name: `${i.productName} (${i.variantTitle})`,
      totalQuantitySold: i._sum.quantity || 0,
      totalRevenue: Number((i._sum.subtotal || 0).toFixed(2)),
    }));
  }

  async getRecentOrders(limit: number = 6) {
    return this.prisma.order.findMany({
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        payment: { select: { method: true, status: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogs(filter: AuditLogFilterDto) {
    const {
      page = 1,
      limit = 20,
      action,
      entity,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entity) where.entity = { contains: entity, mode: 'insensitive' };
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
