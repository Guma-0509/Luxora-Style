'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/utils';
import { Product } from '../../../../types';
import {
  Package,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Nike Air Jordan 1 Retro High OG',
    slug: 'nike-air-jordan-1-retro-high-og',
    sku: 'NK-AJ1-OG',
    category: { name: 'Tenis & Sneakers', slug: 'tenis-sneakers' },
    brand: { name: 'Nike' },
    basePrice: 180.0,
    compareAtPrice: 210.0,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600' }],
    variants: [
      { id: 'v1', sku: 'NK-AJ1-CHI-40', title: 'Chicago Red / Talla 40', price: 180, stock: 35 },
      { id: 'v2', sku: 'NK-AJ1-CHI-42', title: 'Chicago Red / Talla 42', price: 180, stock: 24 },
      { id: 'v3', sku: 'NK-AJ1-BLK-42', title: 'Shadow Black / Talla 42', price: 185, stock: 18 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Adidas Ultraboost Light Running',
    slug: 'adidas-ultraboost-light-running',
    sku: 'AD-UB-LIGHT',
    category: { name: 'Tenis & Sneakers', slug: 'tenis-sneakers' },
    brand: { name: 'Adidas' },
    basePrice: 149.99,
    compareAtPrice: 190.0,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600' }],
    variants: [
      { id: 'v4', sku: 'AD-UB-WHT-41', title: 'Triple White / Talla 41', price: 149.99, stock: 40 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Dior Sauvage Eau de Parfum 100ml',
    slug: 'dior-sauvage-eau-de-parfum-100ml',
    sku: 'DIOR-SV-100',
    category: { name: 'Perfumes & Fragancias', slug: 'perfumes-fragancias' },
    brand: { name: 'Dior' },
    basePrice: 135.0,
    compareAtPrice: 160.0,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600' }],
    variants: [
      { id: 'v5', sku: 'DIOR-SV-EDP-100ML', title: 'Frasco 100ml EDP', price: 135, stock: 45 },
      { id: 'v6', sku: 'DIOR-SV-EDP-200ML', title: 'Frasco 200ml Jumbo', price: 195, stock: 20 },
    ],
  },
  {
    id: 'prod-4',
    name: 'Camiseta Casual Heavy Cotton Oversize',
    slug: 'camiseta-casual-heavy-cotton-oversize',
    sku: 'TS-OVR-HVY',
    category: { name: 'T-Shirts & Camisetas', slug: 't-shirts-camisetas' },
    brand: { name: 'Zara Man' },
    basePrice: 22.5,
    compareAtPrice: 35.0,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' }],
    variants: [
      { id: 'v7', sku: 'TS-OVR-WHT-M', title: 'Blanco Crudo / Talla M', price: 22.5, stock: 65 },
      { id: 'v8', sku: 'TS-OVR-BLK-L', title: 'Negro Lavado / Talla L', price: 22.5, stock: 38 },
    ],
  },
  {
    id: 'prod-5',
    name: 'Jeans Ajustados Slim Fit Denim Stretch',
    slug: 'jeans-ajustados-slim-fit-denim-stretch',
    sku: 'JNS-SLIM-511',
    category: { name: 'Pantalones & Jeans', slug: 'pantalones-jeans' },
    brand: { name: 'Levi\'s' },
    basePrice: 39.99,
    compareAtPrice: 59.99,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=600' }],
    variants: [
      { id: 'v9', sku: 'JNS-SLIM-32', title: 'Azul Medio / Talla 32', price: 39.99, stock: 48 },
    ],
  },
  {
    id: 'prod-6',
    name: 'Reloj Cronógrafo Acero Inoxidable Black Dial',
    slug: 'reloj-cronografo-acero-inoxidable-black-dial',
    sku: 'RLJ-CRN-BLK',
    category: { name: 'Relojes & Accesorios', slug: 'relojes-accesorios' },
    brand: { name: 'Casio / G-Shock' },
    basePrice: 89.0,
    compareAtPrice: 130.0,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600' }],
    variants: [
      { id: 'v10', sku: 'RLJ-SLV-BLK', title: 'Plata con Esfera Negra', price: 89, stock: 25 },
    ],
  },
  {
    id: 'prod-7',
    name: 'Gorra New Era NY Yankees 59FIFTY Fitted',
    slug: 'gorra-new-era-ny-yankees-59fifty-fitted',
    sku: 'NE-NY-5950',
    category: { name: 'Gorras & Caps', slug: 'gorras-caps' },
    brand: { name: 'New Era' },
    basePrice: 38.0,
    compareAtPrice: 45.0,
    status: 'PUBLISHED',
    images: [{ url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600' }],
    variants: [
      { id: 'v11', sku: 'NE-NY-NAVY-714', title: 'Azul Navy / Talla 7 1/4', price: 38, stock: 30 },
      { id: 'v12', sku: 'NE-NY-BLK-712', title: 'Black on Black / Talla 7 1/2', price: 40, stock: 22 },
    ],
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
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
  });

  const fetchProducts = () => {
    api
      .get('/admin/products')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      categoryName: 'Tenis & Sneakers',
      brandName: 'Nike',
      basePrice: 50.0,
      compareAtPrice: 70.0,
      imageUrl: '',
      stock: 25,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      categoryName: prod.category?.name || 'Tenis & Sneakers',
      brandName: prod.brand?.name || 'Nike',
      basePrice: prod.basePrice,
      compareAtPrice: prod.compareAtPrice || 0,
      imageUrl: prod.images?.[0]?.url || '',
      stock: prod.variants?.[0]?.stock || 20,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              sku: formData.sku,
              basePrice: Number(formData.basePrice),
              compareAtPrice: Number(formData.compareAtPrice),
              category: { name: formData.categoryName },
              brand: { name: formData.brandName },
              images: [{ url: formData.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' }],
            }
          : p,
      );
      setProducts(updated);
      showNotification('Producto actualizado exitosamente', 'success');
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        sku: formData.sku.toUpperCase(),
        basePrice: Number(formData.basePrice),
        compareAtPrice: Number(formData.compareAtPrice),
        status: 'PUBLISHED',
        category: { name: formData.categoryName },
        brand: { name: formData.brandName },
        images: [{ url: formData.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' }],
        variants: [
          {
            id: `var-${Date.now()}`,
            sku: `${formData.sku.toUpperCase()}-STD`,
            title: 'Estándar',
            price: Number(formData.basePrice),
            stock: Number(formData.stock),
          },
        ],
      };
      setProducts([newProd, ...products]);
      showNotification('Producto agregado al catálogo exitosamente', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;

    const duplicated = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copia)`,
      sku: `${original.sku}-COPY`,
      status: 'DRAFT',
    };

    setProducts([duplicated, ...products]);
    showNotification(`Producto duplicado: ${duplicated.sku}`, 'success');
  };

  const handleToggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
          return { ...p, status: next };
        }
        return p;
      }),
    );
    showNotification('Estado del producto actualizado', 'success');
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Deseas eliminar "${name}" del catálogo?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showNotification(`Producto "${name}" eliminado`, 'success');
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
          <h1 className="text-2xl font-black text-[#353535] tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-[#3C6E71]" />
            Gestión de Productos & Catálogo
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Administra artículos de moda, zapatillas, perfumes, relojes y precios
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* 2. Notification Toast */}
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

      {/* 3. Filter Bar */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:ring-1 focus:ring-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777]" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2 text-xs font-bold text-[#777777] hover:text-[#353535]"
            >
              ×
            </button>
          )}
        </div>

        <span className="text-xs font-bold text-[#777777]">
          Total: <strong className="text-[#353535]">{filteredProducts.length}</strong> productos
        </span>
      </div>

      {/* 4. Products Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535]">
            <thead className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 text-[11px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">SKU Base</th>
                <th className="py-3.5 px-4">Categoría / Marca</th>
                <th className="py-3.5 px-4">Precio</th>
                <th className="py-3.5 px-4 text-center">Variantes</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#D9D9D9]/15 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-[#D9D9D9]/30 border border-[#D9D9D9] p-0.5 flex items-center justify-center">
                        {prod.images?.[0]?.url ? (
                          <img
                            src={prod.images[0].url}
                            alt={prod.name}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-[#777777]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#353535] line-clamp-1">{prod.name}</p>
                        <span className="text-[10px] text-[#777777] font-mono">
                          {prod.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 25} unidades en stock
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#353535]">{prod.sku}</td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#353535] font-semibold">{prod.category?.name || 'Moda'}</p>
                    <p className="text-[10px] text-[#777777]">{prod.brand?.name || 'Wally'}</p>
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#353535]">
                    {formatCurrency(prod.basePrice)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block rounded-full bg-[#3C6E71]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3C6E71]">
                      {prod.variants?.length || 1} opciones
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(prod.id)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer border ${
                        prod.status === 'PUBLISHED'
                          ? 'bg-[#3C6E71] text-white border-[#3C6E71]'
                          : 'bg-[#D9D9D9]/50 text-[#777777] border-[#D9D9D9]'
                      }`}
                    >
                      {prod.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:bg-[#353535] hover:text-white transition-colors cursor-pointer"
                        title="Editar Producto"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(prod.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:bg-[#D9D9D9]/30 transition-colors cursor-pointer"
                        title="Duplicar Producto"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] text-[#777777] hover:bg-[#D9D9D9]/50 hover:text-[#353535] transition-colors cursor-pointer"
                        title="Eliminar Producto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-3">
              <h3 className="text-base font-black text-[#353535] flex items-center gap-2">
                <Package className="h-5 w-5 text-[#3C6E71]" />
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto en Catálogo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] hover:bg-[#D9D9D9]/30 hover:text-[#353535]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Nombre del Artículo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Sudadera Hoodie Streetwear Heavy"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">SKU Base *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="EJ. HD-STREET-01"
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 font-mono uppercase text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Categoría</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none"
                  >
                    <option value="Tenis & Sneakers">Tenis & Sneakers</option>
                    <option value="Perfumes & Fragancias">Perfumes & Fragancias</option>
                    <option value="T-Shirts & Camisetas">T-Shirts & Camisetas</option>
                    <option value="Pantalones & Jeans">Pantalones & Jeans</option>
                    <option value="Relojes & Accesorios">Relojes & Accesorios</option>
                    <option value="Gorras & Caps">Gorras & Caps</option>
                    <option value="Camisas & Polos">Camisas & Polos</option>
                    <option value="Chaquetas & Hoodies">Chaquetas & Hoodies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Precio Antes ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353535] mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] focus:border-[#3C6E71] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">URL Imagen del Producto</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
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
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
