import React from 'react';
import { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';
import { INITIAL_PRODUCTS } from '../../../lib/mockData';
import { Product } from '../../../types';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

async function getInitialProduct(slug: string): Promise<Product | null> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${baseURL}/products/slug/${slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      return json.data as Product;
    }
  } catch (error) {}

  // Fallback to initial mock products
  const mockFound = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  return (mockFound as Product) || null;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getInitialProduct(params.slug);
  const title = product?.name || 'Producto Exclusivo';

  return {
    title: `${title} | Luxora Style`,
    description: product?.shortDescription || product?.description?.slice(0, 160) || 'Moda, calzado y fragancias de lujo en Luxora Style.',
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const initialProduct = await getInitialProduct(params.slug);

  return <ProductDetailClient initialProduct={initialProduct} slug={params.slug} />;
}
