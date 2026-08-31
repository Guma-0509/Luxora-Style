'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import { Category } from '../../../../types';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Package,
  Layers,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Tenis & Sneakers', slug: 'tenis-sneakers', description: 'Calzado deportivo, urbano y de colección', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400', _count: { products: 12 } },
  { id: 'cat-2', name: 'Perfumes & Fragancias', slug: 'perfumes-fragancias', description: 'Perfumes de diseñador para hombre y mujer', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400', _count: { products: 8 } },
  { id: 'cat-3', name: 'T-Shirts & Camisetas', slug: 't-shirts-camisetas', description: 'Camisetas oversize, básicas y de corte urbano', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400', _count: { products: 15 } },
  { id: 'cat-4', name: 'Pantalones & Jeans', slug: 'pantalones-jeans', description: 'Jeans denim, pantalones cargo y joggers', imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=400', _count: { products: 9 } },
  { id: 'cat-5', name: 'Relojes & Accesorios', slug: 'relojes-accesorios', description: 'Relojes elegantes, cronógrafos y smartwatches', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400', _count: { products: 14 } },
  { id: 'cat-6', name: 'Gorras & Caps', slug: 'gorras-caps', description: 'Gorras snapback, trucker y fitted originales', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400', _count: { products: 7 } },
  { id: 'cat-7', name: 'Camisas & Polos', slug: 'camisas-polos', description: 'Camisas casuales y polos clásicos', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400', _count: { products: 6 } },
  { id: 'cat-8', name: 'Chaquetas & Hoodies', slug: 'chaquetas-hoodies', description: 'Sudaderas con capucha y chaquetas de temporada', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400', _count: { products: 5 } },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentId: '',
  });

  const fetchCategories = () => {
    api
      .get('/admin/categories')
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      parentId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      parentId: cat.parentId || '',
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generatedSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...formData } : c)),
      );
      showNotification('Categoría actualizada exitosamente', 'success');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        ...formData,
        _count: { products: 0 },
      };
      setCategories((prev) => [newCat, ...prev]);
      showNotification('Categoría creada exitosamente', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showNotification(`Categoría "${name}" eliminada correctamente`, 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-[#3C6E71]" />
            Gestión de Categorías
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Administra las categorías del catálogo, jerarquía e imágenes destacadas
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] transition-all shadow-subtle active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Categoría</span>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, slug o descripción..."
            className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 pl-10 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#777777]" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-xs font-bold text-[#777777] hover:text-[#353535]"
            >
              ×
            </button>
          )}
        </div>

        <span className="text-xs font-bold text-[#777777]">
          Total: <strong className="text-[#353535]">{filteredCategories.length}</strong> categorías
        </span>
      </div>

      {/* 4. Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#353535]">
            <thead className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 text-[11px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Slug URL</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4 text-center">Productos</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#D9D9D9]/15 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-[#D9D9D9]/30 border border-[#D9D9D9] p-0.5 flex items-center justify-center">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-[#777777]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#353535] text-xs">{cat.name}</p>
                        <span className="text-[10px] text-[#777777] font-mono">ID: {cat.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#3C6E71] font-semibold">
                    /{cat.slug}
                  </td>
                  <td className="py-3.5 px-4 text-[#777777] max-w-xs truncate">
                    {cat.description || 'Sin descripción'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#3C6E71]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3C6E71]">
                      <Package className="h-3 w-3 text-[#3C6E71]" />
                      {cat._count?.products ?? 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:bg-[#353535] hover:text-white transition-colors cursor-pointer"
                        title="Editar Categoría"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] text-[#777777] hover:bg-[#D9D9D9]/50 hover:text-[#353535] transition-colors cursor-pointer"
                        title="Eliminar Categoría"
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

      {/* 5. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-dropdown space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-4">
              <h3 className="text-base font-black text-[#353535] flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-[#3C6E71]" />
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] hover:bg-[#D9D9D9]/30 hover:text-[#353535]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. Tenis & Sneakers"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Slug URL (Identificador) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej. tenis-sneakers"
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2.5 font-mono text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción para el catálogo y SEO..."
                  className="w-full rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] px-3.5 py-2 text-xs text-[#353535] placeholder:text-[#777777] focus:border-[#3C6E71] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] mb-1">
                  URL de Imagen Destacada
                </label>
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
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
