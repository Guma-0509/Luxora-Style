'use client';

import React, { useState } from 'react';
import { ProductImage } from '../../types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    images.find((img) => img.isMain)?.url ||
      images[0]?.url ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
  );

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: 'placeholder',
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
            thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200',
            altText: productName,
            isMain: true,
            displayOrder: 1,
          },
        ];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails list */}
      <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto max-h-[500px] scrollbar-thin">
        {displayImages.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img.url)}
            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
              selectedImage === img.url
                ? 'border-primary-900 ring-2 ring-primary-900/20'
                : 'border-slate-200 opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={img.thumbnailUrl || img.url}
              alt={img.altText || productName}
              className="h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Image viewer */}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <img
          src={selectedImage}
          alt={productName}
          className="h-full w-full object-cover object-center transition-all duration-300"
        />
      </div>
    </div>
  );
}
