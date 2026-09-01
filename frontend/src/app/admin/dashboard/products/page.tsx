'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '../../../../lib/utils';
import { useCatalog } from '../../../../lib/catalogStore';
import { Product } from '../../../../types';
import {
  Package,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit2,
  Eye,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Store,
} from 'lucide-react';

export default function AdminProductsPage() {
  const { products, categories, addOrUpdateProduct, removeProduct, toggleStatus } = useCatalog();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryName: 'Tenis & Sneakers',
    brandName: 'Nike',
    basePrice: 50.0,
    compareAtPrice: 70.0,
    imageUrl: '',
    stock: 25,
    sizes: '40, 41, 42, 43',
    colors: 'Negro, Blanco',
    description: '',
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `LX-${Date.now().toString().slice(-4)}`,
      categoryName: categories[0]?.name || 'Tenis & Sneakers',
      brandName: 'Luxora Selection',
      basePrice: 65.0,
      compareAtPrice: 85.0,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
      stock: 30,
      sizes: 'S, M, L, XL',
      colors: 'Negro, Blanco',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);

    // Extract sizes and colors from existing variants
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();

    (prod.variants || []).forEach((v: any) => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([k, val]) => {
          if (k.toLowerCase().includes('tal') || k.toLowerCase().includes('siz')) sizeSet.add(String(val));
          if (k.toLowerCase().includes('col')) colorSet.add(String(val));
        });
      }
      if (v.title && v.title.includes('/')) {
        const parts = v.title.split('/').map((p: string) => p.trim());
        if (parts[0]) colorSet.add(parts[0]);
        if (parts[1]) sizeSet.add(parts[1].replace(/talla/i, '').trim());
      }
    });

    setFormData({
      name: prod.name,
      sku: prod.sku,
      categoryName: prod.category?.name || 'Tenis & Sneakers',
      brandName: prod.brand?.name || 'Luxora Selection',
      basePrice: prod.basePrice,
      compareAtPrice: prod.compareAtPrice || 0,
      imageUrl: prod.images?.[0]?.url || '',
      stock: prod.variants?.[0]?.stock || 20,
      sizes: Array.from(sizeSet).join(', ') || 'Única',
      colors: Array.from(colorSet).join(', ') || 'Original',
      description: prod.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    // Build variants array from sizes and colors
    const sizesArr = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const colorsArr = formData.colors.split(',').map((c) => c.trim()).filter(Boolean);

    const generatedVariants: any[] = [];
    const baseSku = formData.sku.toUpperCase();

    if (sizesArr.length > 0 && colorsArr.length > 0) {
      colorsArr.forEach((col) => {
        sizesArr.forEach((sz) => {
          generatedVariants.push({
            id: `var-${Date.now()}-${col}-${sz}`,
            sku: `${baseSku}-${col.slice(0, 3).toUpperCase()}-${sz.replace(/\s+/g, '')}`,
            title: `${col} / Talla ${sz}`,
            price: Number(formData.basePrice),
            stock: Math.max(1, Math.round(Number(formData.stock) / (colorsArr.length * sizesArr.length))),
            attributes: { Color: col, Talla: sz },
          });
        });
      });
    } else if (sizesArr.length > 0) {
      sizesArr.forEach((sz) => {
        generatedVariants.push({
          id: `var-${Date.now()}-${sz}`,
          sku: `${baseSku}-${sz.replace(/\s+/g, '')}`,
          title: `Talla ${sz}`,
          price: Number(formData.basePrice),
          stock: Math.max(1, Math.round(Number(formData.stock) / sizesArr.length)),
          attributes: { Talla: sz },
        });
      });
    } else {
      generatedVariants.push({
        id: `var-${Date.now()}-std`,
        sku: `${baseSku}-STD`,
        title: 'Estándar',
        price: Number(formData.basePrice),
        stock: Number(formData.stock),
        attributes: { Opción: 'Estándar' },
      });
    }

    const payload = {
      ...(editingProduct || {}),
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      basePrice: Number(formData.basePrice),
      compareAtPrice: Number(formData.compareAtPrice) || null,
      categoryName: formData.categoryName,
      brandName: formData.brandName,
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
      stock: Number(formData.stock),
      description: formData.description.trim() || `Artículo exclusivo ${formData.name} de la colección oficial Luxora Style. Calidad garantizada.`,
      variants: generatedVariants,
      status: editingProduct ? editingProduct.status : 'PUBLISHED',
    };

    addOrUpdateProduct(payload);

    if (editingProduct) {
      showNotification('Producto actualizado exitosamente en el catálogo', 'success');
    } else {
      showNotification('¡Producto agregado y publicado en Primera Plana exitosamente!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (prod: any) => {
    const duplicated = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Copia)`,
      sku: `${prod.sku}-COPY`,
      status: 'PUBLISHED',
    };

    addOrUpdateProduct(duplicated);
    showNotification(`Producto duplicado y guardado: ${duplicated.sku}`, 'success');
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus(id);
    showNotification('Estado del producto actualizado', 'success');
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Deseas eliminar "${name}" del catálogo?`)) return;
    removeProduct(id);
    showNotification(`Producto "${name}" eliminado del catálogo`, 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Gestión de Productos & Catálogo
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Los productos creados aquí se publican automáticamente en la <strong className="text-[#3C6E71] dark:text-[#4D8B8E]">Primera Plana</strong> y el catálogo completo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] px-3.5 py-2.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#353535] dark:hover:border-[#4D8B8E] transition-all shadow-subtle"
          >
            <Store className="h-4 w-4 text-[#3C6E71] dark:text-[#4D8B8E]" />
            <span>Ver Primera Plana</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all shadow-subtle active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Toast */}
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

      {/* 3. Filter Bar */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 pl-10 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:ring-1 focus:ring-[#3C6E71] dark:focus:ring-[#4D8B8E] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777] dark:text-[#A8ABB2]" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2 text-xs font-bold text-[#777777] dark:text-[#A8ABB2] hover:text-[#353535] dark:hover:text-[#F5F6F8]"
            >
              ×
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-[#777777] dark:text-[#A8ABB2]">
          Total: <span className="text-[#353535] dark:text-[#F5F6F8]">{filteredProducts.length} artículos</span>
        </div>
      </div>

      {/* 4. Products Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Producto & Imagen</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">Precio Base</th>
                <th className="px-6 py-3.5">Variantes / Stock</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isPublished = prod.status === 'PUBLISHED';
                  const totalStock = (prod.variants || []).reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
                  const imgUrl = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

                  return (
                    <tr key={prod.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                      {/* Product & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/30 dark:bg-[#1E1F20] p-0.5">
                            <img src={imgUrl} alt={prod.name} className="h-full w-full object-cover rounded-lg" />
                          </div>
                          <div>
                            <p className="font-bold text-[#353535] dark:text-[#F5F6F8] line-clamp-1">{prod.name}</p>
                            <span className="font-mono text-[10px] text-[#777777] dark:text-[#A8ABB2]">SKU: {prod.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#D9D9D9]/30 dark:bg-[#1E1F20] px-2.5 py-1 text-[10px] font-bold text-[#353535] dark:text-[#F5F6F8] border border-[#D9D9D9] dark:border-[#3A3B3C]">
                          {prod.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-mono font-black text-[#353535] dark:text-[#F5F6F8]">
                        {formatCurrency(prod.basePrice)}
                        {prod.compareAtPrice && prod.compareAtPrice > prod.basePrice && (
                          <span className="block text-[10px] text-[#777777] dark:text-[#A8ABB2] line-through font-normal">
                            {formatCurrency(prod.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock / Variants */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-xs text-[#353535] dark:text-[#F5F6F8]">{totalStock} unidades</span>
                        <span className="block text-[10px] text-[#777777] dark:text-[#A8ABB2]">
                          {(prod.variants || []).length} variantes
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prod.id)}
                          className={`rounded-full px-3 py-1 text-[10px] font-black transition-all cursor-pointer ${
                            isPublished
                              ? 'bg-[#3C6E71]/15 dark:bg-[#4D8B8E]/20 text-[#3C6E71] dark:text-[#4D8B8E] border border-[#3C6E71]/40'
                              : 'bg-[#D9D9D9] dark:bg-[#3A3B3C] text-[#777777] dark:text-[#A8ABB2] border border-[#D9D9D9] dark:border-[#3A3B3C]'
                          }`}
                        >
                          {isPublished ? 'PUBLICADO' : 'BORRADOR'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* VER */}
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                            title="Ver en Tienda"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                            <span>Ver</span>
                          </Link>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#3C6E71]/40 dark:border-[#4D8B8E]/40 bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 px-2.5 py-1.5 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] hover:bg-[#3C6E71] hover:text-white dark:hover:bg-[#4D8B8E] dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                            title="Editar Producto"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                            title="Borrar Producto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Borrar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                <Package className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                {editingProduct ? 'Editar Producto del Catálogo' : 'Nuevo Producto para Primera Plana & Catálogo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] hover:text-[#353535] dark:hover:text-[#F5F6F8] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                  Nombre del Artículo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Tenis Nike Dunk Low Retro Panda"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">SKU Base *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="EJ. NK-DUNK-PND"
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono uppercase text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Categoría</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Precio Antes ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Stock Total</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Tallas y Colores dinámicos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                    Tallas Disponibles (Separar por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="Ej. 40, 41, 42 o S, M, L"
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">
                    Colores / Estilos (Separar por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Ej. Negro, Blanco, Azul"
                    className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">URL Imagen del Producto</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
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
                  {editingProduct ? 'Guardar Cambios' : 'Guardar y Publicar en Primera Plana'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
