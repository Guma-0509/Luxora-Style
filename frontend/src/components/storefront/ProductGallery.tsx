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
            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
              selectedImage === img.url
                ? 'border-[#3C6E71] dark:border-[#4D8B8E] ring-2 ring-[#3C6E71]/30'
                : 'border-[#D9D9D9] dark:border-[#3A3B3C] opacity-70 hover:opacity-100'
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
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20]">
        <img
          src={selectedImage}
          alt={productName}
          className="h-full w-full object-cover object-center transition-all duration-300"
        />
      </div>
    </div>
  );
}
