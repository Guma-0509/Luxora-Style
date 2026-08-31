'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      {/* 1. VALUE PROPOSITIONS BAR */}
      <div className="border-b border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-brand-light">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Envíos Rápidos</h4>
                <p className="text-xs text-slate-400">Gratis en órdenes mayores a $150</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pago 100% Seguro</h4>
                <p className="text-xs text-slate-400">Encriptación de nivel bancario</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Devolución Fácil</h4>
                <p className="text-xs text-slate-400">Garantía de cambio en 30 días</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-purple-400">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Soporte 24/7</h4>
                <p className="text-xs text-slate-400">Atención personalizada y rápida</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-black text-white text-lg">
                W
              </div>
              <span className="text-xl font-black text-white tracking-tight">WALLY COMMERCE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Plataforma de comercio electrónico líder en tecnología, moda y estilo de vida. Ofrecemos una experiencia de compra intuitiva, productos de alta calidad y entrega garantizada.
            </p>
            {/* Newsletter */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white">Suscríbete para ofertas exclusivas</span>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Tu correo electrónico..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors"
                >
                  Unirme <ArrowRight className="h-3 w-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Catálogo</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?categorySlug=electronica" className="hover:text-white transition-colors">Electrónica & Smartphones</Link></li>
              <li><Link href="/products?categorySlug=computadoras-laptops" className="hover:text-white transition-colors">Laptops & Computadoras</Link></li>
              <li><Link href="/products?categorySlug=moda-calzado" className="hover:text-white transition-colors">Moda & Calzado</Link></li>
              <li><Link href="/products?offersOnly=true" className="hover:text-white transition-colors">Ofertas Especiales</Link></li>
              <li><Link href="/products?newArrivals=true" className="hover:text-white transition-colors">Nuevos Lanzamientos</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Servicio al Cliente</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Rastreo de Envíos</Link></li>
              <li><Link href="/help/returns" className="hover:text-white transition-colors">Políticas de Devolución</Link></li>
              <li><Link href="/help/warranty" className="hover:text-white transition-colors">Garantía de Productos</Link></li>
              <li><Link href="/help/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Centro de Contacto</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Empresa</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad & Seguridad</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/admin/login" className="text-slate-500 hover:text-slate-300 transition-colors">Acceso Administrativo</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800 pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Wally Commerce Inc. Todos los derechos reservados.</p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0 text-slate-500">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Stripe</span>
            <span>Pago Contra Entrega</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
