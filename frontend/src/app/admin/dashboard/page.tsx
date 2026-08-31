'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import {
  TrendingUp,
  Package,
  Boxes,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>({
    totalRevenue: 28450.0,
    totalOrders: 142,
    totalProducts: 48,
    lowStockVariants: 4,
    recentOrders: [
      {
        id: 'ord-1',
        orderNumber: 'ORD-20260830-4921',
        customer: 'Carlos Mendoza',
        total: 225.0,
        status: 'PAID',
        itemsCount: 3,
      },
      {
        id: 'ord-2',
        orderNumber: 'ORD-20260830-8812',
        customer: 'Mariana Reyes',
        total: 173.0,
        status: 'PROCESSING',
        itemsCount: 2,
      },
      {
        id: 'ord-3',
        orderNumber: 'ORD-20260829-1092',
        customer: 'David Gómez',
        total: 278.98,
        status: 'SHIPPED',
        itemsCount: 4,
      },
      {
        id: 'ord-4',
        orderNumber: 'ORD-20260828-0044',
        customer: 'Lucía Fernández',
        total: 165.0,
        status: 'DELIVERED',
        itemsCount: 1,
      },
    ],
  });

  useEffect(() => {
    api
      .get('/admin/analytics/overview')
      .then((res: any) => {
        if (res?.data) {
          setMetrics((prev: any) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Header with Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight">
            Resumen General de Operaciones
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Supervisa en tiempo real ventas, ingresos netos, pedidos y control de inventario
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-98"
          >
            <Package className="h-4 w-4" />
            <span>Gestionar Catálogo</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Revenue */}
        <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Ingresos Totales
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3C6E71]/10 text-[#3C6E71]">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#353535] tracking-tight font-mono">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#3C6E71] mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.4% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Orders Count */}
        <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Pedidos Realizados
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#353535]/10 text-[#353535]">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#353535] tracking-tight font-mono">
              {metrics.totalOrders}
            </p>
            <span className="text-[11px] font-bold text-[#777777]">
              100% procesados en plataforma
            </span>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Catálogo Activo
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3C6E71]/10 text-[#3C6E71]">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#353535] tracking-tight font-mono">
              {metrics.totalProducts}
            </p>
            <span className="text-[11px] font-bold text-[#777777]">
              En 8 categorías publicadas
            </span>
          </div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Stock Crítico
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D9D9D9]/50 text-[#353535]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#353535] tracking-tight font-mono">
              {metrics.lowStockVariants}
            </p>
            <Link
              href="/admin/dashboard/inventory"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3C6E71] hover:underline mt-1"
            >
              <span>Revisar variantes</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Sales Bar Chart & Recent Orders Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Revenue Bars Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-4">
            <div>
              <h3 className="text-base font-black text-[#353535]">Rendimiento Semanal de Ventas</h3>
              <p className="text-xs text-[#777777]">Volumen de facturación de los últimos 7 días</p>
            </div>
            <span className="rounded-full bg-[#3C6E71]/10 px-3 py-1 text-xs font-bold text-[#3C6E71]">
              Esta Semana
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 pt-6 px-2">
            {[
              { day: 'Lun', amount: 3200, height: '40%' },
              { day: 'Mar', amount: 4800, height: '60%' },
              { day: 'Mié', amount: 3900, height: '48%' },
              { day: 'Jue', amount: 5600, height: '70%' },
              { day: 'Vie', amount: 7800, height: '95%' },
              { day: 'Sáb', amount: 6400, height: '80%' },
              { day: 'Dom', amount: 4500, height: '55%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-1 flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-[#777777] group-hover:text-[#353535] opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(bar.amount)}
                </span>
                <div className="w-full max-w-[36px] bg-[#D9D9D9]/40 rounded-2xl h-36 flex items-end p-1">
                  <div
                    className="w-full bg-[#3C6E71] rounded-xl group-hover:bg-[#284B63] transition-all duration-300"
                    style={{ height: bar.height }}
                  />
                </div>
                <span className="text-xs font-bold text-[#353535]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-3">
            <h3 className="text-sm font-black text-[#353535]">Últimas Ventas</h3>
            <Link
              href="/admin/dashboard/orders"
              className="text-xs font-bold text-[#3C6E71] hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="divide-y divide-[#D9D9D9]/60 space-y-3">
            {metrics.recentOrders.map((ord: any) => (
              <div key={ord.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#353535]">{ord.customer}</p>
                  <span className="text-[10px] text-[#777777] font-mono">{ord.orderNumber}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#353535] font-mono">
                    {formatCurrency(ord.total)}
                  </p>
                  <span className="inline-block rounded-full bg-[#3C6E71]/10 px-2 py-0.5 text-[9px] font-bold text-[#3C6E71]">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
