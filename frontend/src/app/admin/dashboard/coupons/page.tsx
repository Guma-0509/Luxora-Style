'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { Coupon } from '../../../../types';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  Tag,
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  Check,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_COUPONS = [
  {
    id: 'coup-1',
    code: 'BIENVENIDO10',
    description: '10% de descuento en tu primera compra de ropa o tenis',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 50,
    maxDiscount: 100,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T23:59:59.000Z',
    usageLimit: 500,
    usedCount: 34,
    isActive: true,
  },
  {
    id: 'coup-2',
    code: 'LUXORAVIP50',
    description: '$50 de descuento directo en compras mayores a $300',
    type: 'FIXED_AMOUNT',
    value: 50,
    minSpend: 300,
    maxDiscount: null,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T23:59:59.000Z',
    usageLimit: 100,
    usedCount: 12,
    isActive: true,
  },
  {
    id: 'coup-3',
    code: 'SNEAKERS20',
    description: '20% off en zapatillas y calzado urbano seleccionado',
    type: 'PERCENTAGE',
    value: 20,
    minSpend: 80,
    maxDiscount: 60,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    usageLimit: 200,
    usedCount: 89,
    isActive: true,
  },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>(INITIAL_COUPONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [viewingCoupon, setViewingCoupon] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 0,
    maxDiscount: '',
    usageLimit: 100,
  });

  useEffect(() => {
    api
      .get('/coupons')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setCoupons(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: 10,
      minSpend: 0,
      maxDiscount: '',
      usageLimit: 100,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      type: c.type || 'PERCENTAGE',
      value: c.value,
      minSpend: c.minSpend || 0,
      maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || 100,
    });
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: formData.code.toUpperCase().trim(),
                description: formData.description,
                type: formData.type,
                value: Number(formData.value),
                minSpend: Number(formData.minSpend) || 0,
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                usageLimit: Number(formData.usageLimit) || 100,
              }
            : c,
        ),
      );
      setNotification({ message: 'Cupón actualizado exitosamente', type: 'success' });
    } else {
      const newCoupon = {
        id: `coup-${Date.now()}`,
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        type: formData.type,
        value: Number(formData.value),
        minSpend: Number(formData.minSpend) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: Number(formData.usageLimit) || 100,
        usedCount: 0,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 365).toISOString(),
      };
      setCoupons([newCoupon, ...coupons]);
      setNotification({ message: 'Cupón creado exitosamente', type: 'success' });
    }

    setIsModalOpen(false);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`¿Deseas eliminar el cupón "${code}"?`)) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setNotification({ message: `Cupón "${code}" eliminado`, type: 'success' });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Cupones & Promociones
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Crea códigos de descuento en porcentaje o monto fijo para campañas de marketing
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all shadow-subtle active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-bold shadow-subtle border animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-[#FFFFFF] dark:bg-[#242526] border-[#3C6E71] dark:border-[#4D8B8E] text-[#3C6E71] dark:text-[#4D8B8E]'
              : 'bg-[#FFFFFF] dark:bg-[#242526] border-[#D9D9D9] dark:border-[#3A3B3C] text-[#353535] dark:text-[#F5F6F8]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-[#3C6E71] dark:text-[#4D8B8E]" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 pl-10 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777] dark:text-[#A8ABB2]" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-xs font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8]"
            >
              ×
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-[#777777] dark:text-[#A8ABB2]">
          Total: <span className="text-[#353535] dark:text-[#F5F6F8]">{filteredCoupons.length} cupones</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código / Descripción</th>
                <th className="py-3.5 px-4">Descuento</th>
                <th className="py-3.5 px-4">Gasto Mínimo</th>
                <th className="py-3.5 px-4">Usos / Límite</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    No se encontraron cupones registrados.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-black text-[#3C6E71] dark:text-[#4D8B8E] text-sm tracking-wider">
                          {c.code}
                        </span>
                        <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2] max-w-xs">{c.description}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#353535] dark:text-[#F5F6F8]">
                      {c.type === 'PERCENTAGE' ? `${c.value}% DESCUENTO` : `${formatCurrency(c.value)} OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-[#777777] dark:text-[#A8ABB2] font-mono">
                      {c.minSpend > 0 ? formatCurrency(c.minSpend) : 'Sin mínimo'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-mono text-[#777777] dark:text-[#A8ABB2]">
                        {c.usedCount || 0} / {c.usageLimit || '∞'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-full bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 text-[#3C6E71] dark:text-[#4D8B8E] border border-[#3C6E71]/30 px-2.5 py-0.5 text-[10px] font-bold">
                        ACTIVO
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* VER */}
                        <button
                          onClick={() => setViewingCoupon(c)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                          title="Ver Cupón"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                          <span>Ver</span>
                        </button>

                        {/* EDITAR */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#3C6E71]/40 dark:border-[#4D8B8E]/40 bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 px-2.5 py-1.5 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] hover:bg-[#3C6E71] hover:text-white dark:hover:bg-[#4D8B8E] dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Editar Cupón"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* BORRAR */}
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Borrar Cupón"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Borrar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW COUPON MODAL */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div>
                <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                  <Tag className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                  Detalles del Cupón
                </h3>
                <p className="text-xs font-mono font-bold text-[#3C6E71] dark:text-[#4D8B8E] mt-0.5">{viewingCoupon.code}</p>
              </div>
              <button
                onClick={() => setViewingCoupon(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Descripción</span>
                <p className="text-xs font-medium text-[#353535] dark:text-[#F5F6F8]">{viewingCoupon.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Descuento</span>
                  <strong className="text-sm font-black text-[#3C6E71] dark:text-[#4D8B8E]">
                    {viewingCoupon.type === 'PERCENTAGE' ? `${viewingCoupon.value}%` : formatCurrency(viewingCoupon.value)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Gasto Mínimo</span>
                  <strong className="text-xs text-[#353535] dark:text-[#F5F6F8]">
                    {viewingCoupon.minSpend > 0 ? formatCurrency(viewingCoupon.minSpend) : 'Sin mínimo'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Veces Usado</span>
                  <strong className="text-xs text-[#353535] dark:text-[#F5F6F8]">{viewingCoupon.usedCount || 0} canjes</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Límite Total</span>
                  <strong className="text-xs text-[#353535] dark:text-[#F5F6F8]">{viewingCoupon.usageLimit || 'Ilimitado'}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C] flex justify-end">
              <button
                onClick={() => setViewingCoupon(null)}
                className="rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white shadow-subtle cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón de Descuento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Código del Cupón *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej. VERANO2026"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono uppercase text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. 10% de descuento en ropa deportiva"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Tipo de Descuento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Valor *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] font-mono focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Gasto Mínimo ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] font-mono focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] font-mono focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3C6E71] dark:bg-[#4D8B8E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] shadow-subtle active:scale-98 cursor-pointer"
                >
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
