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
  Check,
  AlertCircle,
  X,
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

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    try {
      const newCoupon = {
        id: `coup-${Date.now()}`,
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        type: formData.type,
        value: Number(formData.value),
        minSpend: Number(formData.minSpend) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: Number(formData.usageLimit) || null,
        usedCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      };

      await api.post('/coupons', newCoupon).catch(() => {});
      setCoupons([newCoupon, ...coupons]);
      setNotification({ message: `Cupón ${newCoupon.code} creado exitosamente`, type: 'success' });
      setIsModalOpen(false);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ message: 'Error al crear el cupón', type: 'error' });
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`¿Eliminar cupón "${code}"?`)) return;
    setCoupons(coupons.filter((c) => c.id !== id));
    setNotification({ message: `Cupón ${code} eliminado`, type: 'success' });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-[#3C6E71]" />
            Gestión de Cupones & Descuentos
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Crea códigos promocionales porcentuales y de monto fijo para campañas de venta
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-bold shadow-subtle border ${
            notification.type === 'success'
              ? 'bg-[#FFFFFF] border-[#3C6E71] text-[#3C6E71]'
              : 'bg-[#FFFFFF] border-[#D9D9D9] text-[#353535]'
          }`}
        >
          <Check className="h-4 w-4 text-[#3C6E71]" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de cupón o descripción..."
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777]" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535]">
            <thead className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 text-[11px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Tipo & Valor</th>
                <th className="py-3.5 px-4">Compra Mínima</th>
                <th className="py-3.5 px-4">Usos</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60">
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#D9D9D9]/15 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-mono font-black text-[#3C6E71] text-sm tracking-wider">
                        {c.code}
                      </span>
                      <p className="text-[11px] text-[#777777] max-w-xs">{c.description}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#353535]">
                    {c.type === 'PERCENTAGE' ? `${c.value}% DESCUENTO` : `${formatCurrency(c.value)} OFF`}
                  </td>
                  <td className="py-3.5 px-4 text-[#777777] font-mono">
                    {c.minSpend > 0 ? formatCurrency(c.minSpend) : 'Sin mínimo'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-mono text-[#777777]">
                      {c.usedCount || 0} / {c.usageLimit || '∞'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-full bg-[#3C6E71]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3C6E71]">
                      ACTIVO
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] text-[#777777] hover:bg-[#D9D9D9]/50 hover:text-[#353535] transition-colors ml-auto cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-3">
              <h3 className="text-base font-black text-[#353535] flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#3C6E71]" />
                Nuevo Cupón de Descuento
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] hover:bg-[#D9D9D9]/30 hover:text-[#353535]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">Código del Cupón *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej. VERANO2026"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 font-mono uppercase text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. 10% de descuento en ropa deportiva"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Tipo de Descuento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Valor</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Gasto Mínimo ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9D9D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#353535] hover:bg-[#D9D9D9]/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3C6E71] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] shadow-subtle active:scale-98 cursor-pointer"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
