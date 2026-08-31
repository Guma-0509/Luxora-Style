export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  permissions?: string[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  subcategories?: Category[];
  _count?: { products: number; subcategories?: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  isMain: boolean;
  displayOrder: number;
}

export interface ProductSpecification {
  id: string;
  key: string;
  value: string;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  sku: string;
  title: string;
  attributes: Record<string, any>;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock: number;
  weight?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  isNewArrival: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId: string;
  category: Category;
  brandId?: string;
  brand?: Brand;
  images: ProductImage[];
  specifications?: ProductSpecification[];
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  reviewsSummary?: {
    averageRating: number;
    totalReviews: number;
  };
  totalStock?: number;
  relatedProducts?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  variant: ProductVariant;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minSpend?: number;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  displayOrder: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
