'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#353535] dark:bg-[#121314] text-[#D9D9D9] transition-colors">
      {/* 1. VALUE PROPOSITIONS BAR */}
      <div className="border-b border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#3C6E71] dark:text-[#4D8B8E]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Envíos Rápidos</h4>
                <p className="text-xs text-[#D9D9D9]">Gratis en órdenes mayores a $150</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#3C6E71] dark:text-[#4D8B8E]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pago 100% Seguro</h4>
                <p className="text-xs text-[#D9D9D9]">Encriptación de nivel bancario</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#3C6E71] dark:text-[#4D8B8E]">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Devolución Fácil</h4>
                <p className="text-xs text-[#D9D9D9]">Garantía de cambio en 30 días</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#3C6E71] dark:text-[#4D8B8E]">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Soporte 24/7</h4>
                <p className="text-xs text-[#D9D9D9]">Atención personalizada y rápida</p>
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
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black border border-white/20 overflow-hidden p-0.5 shadow-subtle">
                <img src="/logo.png" alt="Luxora Style" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">LUXORA STYLE</span>
            </div>
            <p className="text-xs text-[#D9D9D9] leading-relaxed max-w-sm">
              Plataforma de comercio electrónico líder en moda urbana, calzado, perfumes, relojes y accesorios exclusivos. Experiencia de compra fluida y entrega garantizada.
            </p>
            {/* Newsletter */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white">Suscríbete para ofertas exclusivas</span>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Tu correo electrónico..."
                    className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-[#D9D9D9]/60 focus:border-[#3C6E71] focus:outline-none"
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-[#D9D9D9]" />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-[#3C6E71] dark:bg-[#4D8B8E] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#284B63] dark:hover:bg-[#3C6E71] transition-colors cursor-pointer"
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
              <li><Link href="/" className="hover:text-white transition-colors">Tenis Urbanos & Sneakers</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Perfumería Exclusiva</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Moda & Calzado</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Relojes de Lujo</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Nuevos Lanzamientos</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Servicio al Cliente</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Rastreo de Envíos</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Políticas de Devolución</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Garantía de Productos</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Centro de Contacto</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Empresa</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Privacidad & Seguridad</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/admin/login" className="text-[#3C6E71] dark:text-[#4D8B8E] hover:text-white transition-colors font-bold">Acceso Administrativo</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-6 text-xs sm:flex-row text-[#D9D9D9]">
          <p>© {new Date().getFullYear()} Luxora Style. Todos los derechos reservados.</p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0 text-xs">
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
