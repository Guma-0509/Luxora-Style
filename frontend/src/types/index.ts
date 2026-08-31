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
  id?: string;
  key?: string;
  name?: string;
  value: string;
  displayOrder?: number;
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
  isActive?: boolean;
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
  totalStock?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId?: string;
  category?: Category;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  linkUrl: string;
  buttonText?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface Address {
  id: string;
  userId?: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  maxStock: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  variant?: ProductVariant;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
