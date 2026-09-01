'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category } from '../../../../types';
import { useCatalog, saveCategoriesCatalog, getStoredCategories, deleteCategoryFromCatalog, deleteAllCategoriesFromCatalog } from '../../../../lib/catalogStore';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Package,
  Layers,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const { categories, refreshCatalog, removeCategory, clearAllCategories } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400',
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
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, name, slug: editingCategory ? prev.slug : slug }));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    const current = getStoredCategories();

    if (editingCategory) {
      const updated = current.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formData.name.trim(),
              slug: formData.slug.trim(),
              description: formData.description.trim(),
              imageUrl: formData.imageUrl.trim() || c.imageUrl,
            }
          : c,
      );
      saveCategoriesCatalog(updated);
      refreshCatalog();
      showNotification('Categoría actualizada exitosamente', 'success');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400',
        _count: { products: 0 },
      };
      saveCategoriesCatalog([newCat, ...current]);
      refreshCatalog();
      showNotification('Categoría creada y sincronizada con el catálogo', 'success');
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    const name = categoryToDelete.name;
    const id = categoryToDelete.id;

    if (removeCategory) {
      removeCategory(id);
    }
    deleteCategoryFromCatalog(id);
    refreshCatalog();

    setCategoryToDelete(null);
    showNotification(`Categoría "${name}" eliminada correctamente`, 'success');
  };

  const handleConfirmClearAll = () => {
    if (clearAllCategories) {
      clearAllCategories();
    }
    deleteAllCategoriesFromCatalog();
    refreshCatalog();

    setIsClearAllModalOpen(false);
    showNotification('Todas las categorías han sido eliminadas', 'success');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#353535] dark:text-[#F5F6F8] tracking-tight flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-[#3C6E71] dark:text-[#4D8B8E]" />
            Categorías & Colecciones
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A8ABB2] mt-1">
            Organiza la estructura de navegación y filtros del catálogo
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {categories.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vaciar Todo ({categories.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#353535] dark:bg-[#4D8B8E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-all shadow-subtle active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Categoría</span>
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

      {/* 3. Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-4 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre de categoría..."
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
          Total: <span className="text-[#353535] dark:text-[#F5F6F8]">{filteredCategories.length} categorías</span>
        </div>
      </div>

      {/* 4. Categories Table */}
      <div className="overflow-hidden rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] uppercase font-bold text-[#777777] dark:text-[#A8ABB2] text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">Slug URL</th>
                <th className="px-6 py-3.5">Descripción</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-[#777777] dark:text-[#A8ABB2]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="h-8 w-8 text-[#777777] opacity-40" />
                      <p className="font-bold text-[#353535] dark:text-[#F5F6F8]">No hay categorías registradas</p>
                      <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Haz clic en &quot;Nueva Categoría&quot; para crear una.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#D9D9D9]/15 dark:hover:bg-[#2E3236]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/30 dark:bg-[#1E1F20] p-0.5">
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#777777]">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-[#353535] dark:text-[#F5F6F8]">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[#777777] dark:text-[#A8ABB2]">
                      /{cat.slug}
                    </td>
                    <td className="px-6 py-4 text-[#777777] dark:text-[#A8ABB2] line-clamp-1 max-w-xs">
                      {cat.description || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Link
                          href={`/?category=${cat.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-2.5 py-1.5 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:text-[#3C6E71] dark:hover:text-[#4D8B8E] transition-all shadow-subtle cursor-pointer"
                          title="Ver en Tienda"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                          <span>Ver</span>
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#3C6E71]/40 dark:border-[#4D8B8E]/40 bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 px-2.5 py-1.5 text-xs font-bold text-[#3C6E71] dark:text-[#4D8B8E] hover:bg-[#3C6E71] hover:text-white dark:hover:bg-[#4D8B8E] dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Editar Categoría"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-subtle cursor-pointer"
                          title="Borrar Categoría"
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

      {/* 5. DELETE CATEGORY CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Eliminar Categoría?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={() => setCategoryToDelete(null)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#D9D9D9]/20 dark:bg-[#1E1F20] border border-[#D9D9D9] dark:border-[#3A3B3C]">
              <strong className="text-sm font-black text-[#353535] dark:text-[#F5F6F8]">{categoryToDelete.name}</strong>
              <p className="text-xs font-mono text-[#777777] dark:text-[#A8ABB2] mt-0.5">/{categoryToDelete.slug}</p>
            </div>

            <p className="text-xs text-[#777777] dark:text-[#A8ABB2]">
              ¿Estás seguro de que deseas eliminar la categoría &quot;{categoryToDelete.name}&quot;?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9D9D9] dark:border-[#3A3B3C]">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
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
                <span>Sí, Eliminar Categoría</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CLEAR ALL CATEGORIES CONFIRMATION MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 dark:border-red-500/40 bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8]">¿Vaciar Todas las Categorías?</h3>
                  <p className="text-[11px] text-[#777777] dark:text-[#A8ABB2]">Se eliminarán {categories.length} categorías</p>
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
              ¿Estás seguro de que deseas eliminar <strong>todas las categorías</strong> ({categories.length} categorías)?
              Podrás crear tus propias categorías cuando lo desees con el botón &quot;Nueva Categoría&quot;.
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

      {/* 7. CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-6 sm:p-8 shadow-dropdown space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] dark:border-[#3A3B3C] pb-3">
              <h3 className="text-base font-black text-[#353535] dark:text-[#F5F6F8] flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-[#3C6E71] dark:text-[#4D8B8E]" />
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#777777] dark:text-[#A8ABB2] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Nombre de Categoría *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. Relojes & Accesorios"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Slug URL (Identificador) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="relojes-accesorios"
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2.5 font-mono text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">Descripción Breve</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Colección exclusiva para amantes de la moda y estilo urbano..."
                  className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#1E1F20] px-3.5 py-2 text-xs text-[#353535] dark:text-[#F5F6F8] placeholder:text-[#777777] dark:placeholder:text-[#A8ABB2] focus:border-[#3C6E71] dark:focus:border-[#4D8B8E] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#353535] dark:text-[#F5F6F8] mb-1">URL de Imagen Representativa</label>
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
