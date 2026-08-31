'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { api } from '../../../lib/api';
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface OrderItemSummary {
  id: string;
  productName: string;
  variantTitle: string;
  quantity: number;
  unitPrice: number;
  variant?: {
    imageUrl?: string | null;
  };
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  items: OrderItemSummary[];
}

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('/orders/my-orders')
        .then((res: any) => {
          if (res.data) setOrders(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Pendiente de Pago
          </span>
        );
      case 'PAID':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Package className="h-3.5 w-3.5" /> En Preparación
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <Truck className="h-3.5 w-3.5" /> En Camino
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Entregado
          </span>
        );
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            <AlertCircle className="h-3.5 w-3.5" /> Cancelado
          </span>
        );
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-500 mb-6 flex items-center space-x-2">
        <Link href="/" className="hover:text-slate-900">Inicio</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Mis Pedidos</span>
      </nav>

      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Historial de Pedidos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consulta el estado de tus compras y descarga tus comprobantes
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No tienes pedidos registrados</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Cuando realices una compra, podrás ver aquí el número de orden y seguir el despacho paso a paso.
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-xl bg-primary-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-800 transition-colors shadow-md"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Top Bar: Order Info & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Middle: Items Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-200"
                      title={`${item.productName} (${item.variantTitle})`}
                    >
                      {item.variant?.imageUrl ? (
                        <img
                          src={item.variant.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                      +{order.items.length - 4} más
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Total</span>
                    <p className="text-base font-black text-slate-900">
                      {formatCurrency(order.grandTotal)}
                    </p>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Seguimiento <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
