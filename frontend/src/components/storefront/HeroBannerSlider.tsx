'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Banner } from '../../types';

interface HeroBannerSliderProps {
  banners?: Banner[];
}

const defaultBanners: Banner[] = [
  {
    id: '1',
    title: 'Nueva Colección de Titanio',
    subtitle: 'Potencia insuperable con el chip A17 Pro y cámara con zoom óptico de 5x.',
    linkUrl: '/products/iphone-15-pro-max',
    desktopImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600',
    buttonText: 'Comprar Ahora',
    displayOrder: 1,
  },
  {
    id: '2',
    title: 'Estilo Urbano Heavyweight',
    subtitle: 'Confeccionadas en algodón peinado 240 GSM con ajuste relajado contemporáneo.',
    linkUrl: '/products/camiseta-basica-premium-heavyweight',
    desktopImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600',
    buttonText: 'Ver Colección',
    displayOrder: 2,
  },
];

export function HeroBannerSlider({ banners = defaultBanners }: HeroBannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const activeBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 h-[380px] sm:h-[460px] md:h-[520px]">
      {activeBanners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image with Gradient Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner.desktopImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12">
            <div className="max-w-xl space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand-light border border-brand/40 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Edición Destacada
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                {banner.title}
              </h1>
              {banner.subtitle && (
                <p className="text-sm sm:text-base text-slate-300 line-clamp-2 sm:line-clamp-none">
                  {banner.subtitle}
                </p>
              )}
              {banner.linkUrl && (
                <div className="pt-2">
                  <Link
                    href={banner.linkUrl}
                    className="inline-flex items-center rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark transition-all transform active:scale-95"
                  >
                    {banner.buttonText || 'Explorar Oferta'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {activeBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === current ? 'w-8 bg-brand' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
