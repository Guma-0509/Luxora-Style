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
  AlertTriangle,
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
  const [couponToDelete, setCouponToDelete] = useState<any | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
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
      showNotification('Cupón actualizado correctamente', 'success');
    } else {
      const newCoupon = {
        id: `coup-${Date.now()}`,
        code: formData.code.toUpperCase().trim(),
        description: formData.description || 'Descuento promocional',
        type: formData.type,
        value: Number(formData.value),
        minSpend: Number(formData.minSpend) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 365).toISOString(),
        usageLimit: Number(formData.usageLimit) || 100,
        usedCount: 0,
        isActive: true,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      showNotification('¡Cupón creado exitosamente!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
    showNotification('Estado del cupón actualizado', 'success');
  };

  const handleConfirmDelete = () => {
    if (!couponToDelete) return;
    const code = couponToDelete.code;
    setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
    setCouponToDelete(null);
    showNotification(`Cupón "${code}" eliminado`, 'success');
  };

  const handleConfirmClearAll = () => {
    setCoupons([]);
    setIsClearAllModalOpen(false);
    showNotification('Se han eliminado todos los cupones promocionales', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
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
            Cupones & Códigos de Descuento
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Crea promociones con descuentos porcentuales (%) o montos fijos ($)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {coupons.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vaciar Todo ({coupons.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all shadow-subtle active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Cupón</span>
          </button>
        </div>
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

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar cupón por código o descripción..."
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
                <th className="px-6 py-3.5">Código Promocional</th>
                <th className="px-6 py-3.5">Descuento</th>
                <th className="px-6 py-3.5">Condiciones</th>
                <th className="px-6 py-3.5">Usos</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tag className="h-8 w-8 text-[#777777] opacity-40" />
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">No hay cupones creados</p>
                      <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Haz clic en &quot;Nuevo Cupón&quot; para crear promociones de descuento.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-black text-[#3C6E71] dark:text-[#4D8B8E] bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 px-2.5 py-1 rounded-xl border border-[#3C6E71]/30">
                        {c.code}
                      </span>
                      <p className="text-[10px] text-[#777777] dark:text-[#A8ABB2] mt-1 line-clamp-1">{c.description}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#353535] dark:text-[#F5F6F8]">
                      {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `${formatCurrency(c.value)} OFF`}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-[#777777] dark:text-[#A8ABB2]">
                      Min: {formatCurrency(c.minSpend || 0)}
                      {c.maxDiscount && ` | Max: ${formatCurrency(c.maxDiscount)}`}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[#353535] dark:text-[#F5F6F8]">
                      {c.usedCount || 0} / {c.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c.id)}
                        className={`rounded-full px-3 py-1 text-[10px] font-black transition-all cursor-pointer ${
                          c.isActive
                            ? 'bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 text-[#3C6E71] dark:text-[#4D8B8E] border border-[#3C6E71]/40'
                            : 'bg-[#D9D9D9] dark:bg-[#3A3B3C] text-[#777777] dark:text-[#A8ABB2] border border-[#D9D9D9] dark:border-[#3A3B3C]'
                        }`}
                      >
                        {c.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* VER */}
                        <button
                          onClick={() => setViewingCoupon(c)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                          title="Ver Detalle"
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
                          onClick={() => setCouponToDelete(c)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Eliminar Cupón"
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

      {/* DELETE SINGLE COUPON MODAL */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Eliminar Cupón?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={() => setCouponToDelete(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
              <strong className="text-sm font-black font-mono text-[#3C6E71] dark:text-[#4D8B8E]">{couponToDelete.code}</strong>
              <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-0.5">{couponToDelete.description}</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-subtle active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sí, Eliminar Cupón</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL COUPONS MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Eliminar Todos los Cupones?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Se eliminarán {coupons.length} cupones</p>
                </div>
              </div>
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#777777] dark:text-[#A8ABB2]">
              ¿Estás seguro de que deseas eliminar <strong>todos los cupones y códigos de descuento</strong> ({coupons.length} promociones)?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-4 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-subtle active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sí, Vaciar Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                Detalle del Cupón
              </h3>
              <button
                onClick={() => setViewingCoupon(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 border border-[#3C6E71]/30">
                <span className="font-mono font-black text-lg text-[#3C6E71] dark:text-[#4D8B8E] block">{viewingCoupon.code}</span>
                <p className="text-xs text-[#353535] dark:text-[#F5F6F8] mt-1">{viewingCoupon.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Tipo de Beneficio</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">
                    {viewingCoupon.type === 'PERCENTAGE' ? `${viewingCoupon.value}% Descuento` : `${formatCurrency(viewingCoupon.value)} Monto Fijo`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Compra Mínima</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">{formatCurrency(viewingCoupon.minSpend || 0)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Veces Utilizado</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">{viewingCoupon.usedCount || 0} compras</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] dark:text-[#A8ABB2] block">Límite Total</span>
                  <strong className="text-[#353535] dark:text-[#F5F6F8]">{viewingCoupon.usageLimit || 'Sin Límite'}</strong>
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
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón Promocional'}
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
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ej. VERANO20"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono uppercase text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Descripción / Regla</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. 20% de descuento en pedidos mayores a $50"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Tipo Descuento</label>
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
                    step="0.1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Gasto Mínimo ($)</label>
                  <input
                    type="number"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
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
