'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Brand } from '../../types';
import { RotateCcw, Check } from 'lucide-react';

interface FacetedSidebarProps {
  categories: Category[];
  brands: Brand[];
}

export function FacetedSidebar({ categories, brands }: FacetedSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('categorySlug') || '';
  const currentBrand = searchParams.get('brandSlug') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStockOnly') === 'true';

  const [minPrice, setMinPrice] = React.useState(minPriceParam);
  const [maxPrice, setMaxPrice] = React.useState(maxPriceParam);

  const updateFilters = (params: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    nextParams.set('page', '1'); // Reset pagination
    router.push(`/products?${nextParams.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filtros</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Limpiar
        </button>
      </div>

      {/* 1. Categorías */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categorías</h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin text-xs">
          <button
            onClick={() => updateFilters({ categorySlug: null })}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
              !currentCategory ? 'bg-primary-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Todas las categorías</span>
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <button
                onClick={() => updateFilters({ categorySlug: cat.slug })}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                  currentCategory === cat.slug
                    ? 'bg-primary-900 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span className="text-[10px] opacity-70">({cat._count.products})</span>
                )}
              </button>
              {/* Subcategories */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="ml-3 space-y-1 border-l-2 border-slate-200 pl-2">
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => updateFilters({ categorySlug: sub.slug })}
                      className={`block w-full text-left rounded-md px-2 py-1 text-[11px] transition-colors ${
                        currentCategory === sub.slug
                          ? 'font-bold text-brand'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Marcas */}
      <div className="space-y-3 border-t border-slate-200 pt-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Marcas</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin text-xs">
          {brands.map((brand) => {
            const isSelected = currentBrand === brand.slug;
            return (
              <button
                key={brand.id}
                onClick={() => updateFilters({ brandSlug: isSelected ? null : brand.slug })}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                  isSelected ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span>{brand.name}</span>
                </div>
                {brand._count?.products !== undefined && (
                  <span className="text-[10px] opacity-60">({brand._count.products})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Rango de Precios */}
      <div className="space-y-3 border-t border-slate-200 pt-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Rango de Precio</h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
          >
            Aplicar Precio
          </button>
        </form>
      </div>

      {/* 4. Disponibilidad */}
      <div className="space-y-3 border-t border-slate-200 pt-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Disponibilidad</h4>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={inStockParam}
            onChange={(e) =>
              updateFilters({ inStockOnly: e.target.checked ? 'true' : null })
            }
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>Solo artículos en stock</span>
        </label>
      </div>
    </div>
  );
}
