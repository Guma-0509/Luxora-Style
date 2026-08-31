'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  LogOut,
  Package,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { Category, Product } from '../../types';

export function Header() {
  const router = useRouter();
  const { getItemCount, openDrawer } = useCartStore();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
    // Cargar árbol de categorías para el menú
    api.get('/categories').then((res: any) => {
      if (res.data) setCategories(res.data);
    }).catch(() => {});
  }, [initAuth]);

  // Autocompletado de búsqueda con debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res: any = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.data) {
          setSuggestions(res.data);
          setShowSuggestions(true);
        }
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cerrar sugerencias al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-primary-950 px-4 py-2 text-xs font-medium text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-brand-light">
              <Truck className="h-3.5 w-3.5" /> Envío GRATIS en compras mayores a $150
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Garantía Oficial & Devolución sin costo
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <Link href="/track-order" className="hover:text-white transition-colors">
              Rastrear Pedido
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/support" className="hover:text-white transition-colors">
              Ayuda
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-white font-black text-xl shadow-md">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                LUXORA STYLE
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-brand-dark uppercase">
                Official Store
              </span>
            </div>
          </Link>

          {/* Search Bar with live autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar por producto, marca, categoría o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              <Search className="absolute left-4 h-4 w-4 text-slate-400" />
              <button
                type="submit"
                className="absolute right-1.5 rounded-full bg-primary-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-800 transition-colors"
              >
                Buscar
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sugerencias Rápidas
                </div>
                <div className="divide-y divide-slate-100">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                        {item.images && item.images[0] && (
                          <img
                            src={item.images[0].thumbnailUrl || item.images[0].url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.brand?.name || item.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">${item.basePrice}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="mt-2 w-full rounded-xl bg-slate-50 py-2 text-center text-xs font-semibold text-brand hover:bg-slate-100 transition-colors"
                >
                  Ver todos los resultados para "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Action Icons (Account & Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* User Profile / Login */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-xs">
                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.firstName}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">{user.role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-brand hover:bg-blue-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Panel Administrativo
                    </Link>
                  )}
                  <Link
                    href="/account/orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Package className="h-3.5 w-3.5" /> Mis Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className="relative flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-semibold">Carrito</span>
              {getItemCount() > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-[11px] font-black text-white">
                  {getItemCount()}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY NAVIGATION BAR */}
      <nav className="hidden border-b border-slate-100 bg-slate-50 px-4 md:block">
        <div className="mx-auto flex max-w-7xl items-center space-x-8 overflow-x-auto py-2.5 text-xs font-semibold text-slate-700">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-slate-900 font-bold hover:text-brand transition-colors"
          >
            <Menu className="h-4 w-4" /> Todos los Productos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categorySlug=${cat.slug}`}
              className="hover:text-brand transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/products?offersOnly=true"
            className="flex items-center gap-1 text-brand-accent font-bold hover:text-orange-700 transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" /> Ofertas Relámpago
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white p-4 md:hidden animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </form>
          <div className="space-y-2">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg p-2 font-bold text-slate-900 hover:bg-slate-100"
            >
              Todos los Productos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categorySlug=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
