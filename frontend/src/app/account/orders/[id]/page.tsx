'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  MapPin,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get(`/orders/my-orders/${id}`)
        .then((res: any) => {
          if (res.data) setOrder(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">Pedido no encontrado</h2>
        <Link
          href="/account/orders"
          className="inline-block rounded-xl bg-primary-900 px-5 py-2 text-xs font-bold text-white hover:bg-primary-800"
        >
          Volver a Mis Pedidos
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Pedido Creado' },
    { key: 'PAID', label: 'Pago Confirmado' },
    { key: 'PROCESSING', label: 'En Preparación' },
    { key: 'SHIPPED', label: 'Despachado' },
    { key: 'DELIVERED', label: 'Entregado' },
  ];

  const statusHierarchy: Record<string, number> = {
    PENDING: 0,
    PAID: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
    REFUNDED: -1,
  };

  const currentStepIndex = statusHierarchy[order.status] ?? 0;
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* 1. Header */}
      <div>
        <nav className="text-xs text-slate-500 mb-3 flex items-center space-x-2">
          <Link href="/account/orders" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Mis Pedidos
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{order.orderNumber}</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Realizado el {formatDate(order.createdAt)}
            </p>
          </div>
          {order.trackingNumber && (
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-xs">
              <span className="font-bold text-purple-900">Guía de Envío ({order.carrier || 'Courier'}):</span>{' '}
              <span className="font-mono font-black text-purple-700">{order.trackingNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Order Tracking Timeline */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-8">
          Seguimiento del Estado
        </h3>

        {isCancelled ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center text-xs font-bold text-red-700">
            Este pedido ha sido {order.status === 'REFUNDED' ? 'reembolsado' : 'cancelado'}.
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
            {/* Horizontal progress line */}
            <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step, index) => {
              const isCompleted = currentStepIndex >= index;
              const isCurrent = currentStepIndex === index;

              return (
                <div
                  key={step.key}
                  className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-brand-dark font-black' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Items & Info Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-4 border-b border-slate-100 mb-4">
              Artículos en el Pedido ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-200">
                    {item.variant?.imageUrl ? (
                      <img src={item.variant.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.productName}</h4>
                    <p className="text-[11px] text-slate-500">{item.variantTitle} × {item.quantity}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <p className="text-[10px] text-slate-400">{formatCurrency(item.unitPrice)} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Shipping & Payment Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand" /> Dirección de Entrega
              </h4>
              <div className="text-xs text-slate-600 leading-relaxed pt-1">
                <p className="font-bold text-slate-900">{order.shippingAddress.recipientName}</p>
                <p>{order.shippingAddress.streetAddress} {order.shippingAddress.apartment}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p className="text-slate-400 mt-1">Tel: {order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment info */}
          {order.payment && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-brand" /> Método de Pago
              </h4>
              <div className="text-xs text-slate-600 pt-1 space-y-1">
                <p className="font-bold text-slate-900">{order.payment.method}</p>
                <p className="text-slate-400">Estado: <span className="text-emerald-600 font-bold">{order.payment.status}</span></p>
              </div>
            </div>
          )}

          {/* Financial summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Desglose de Costos
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Descuento</span>
                  <span>-{formatCurrency(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{order.shippingTotal === 0 ? 'GRATIS' : formatCurrency(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos (18% ITBIS)</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
