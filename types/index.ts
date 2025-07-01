export interface ProductCategory {
  id: string
  name: string
  slug: string
  parentId?: string
}

// ACTUALIZADA: Interface de producto con nuevos campos de precio
export interface Product {
  id: string
  name: string
  description: string
  regular_price: number // NUEVO: Precio normal
  sale_price?: number // NUEVO: Precio de oferta (opcional)
  is_on_sale: boolean // NUEVO: Indica si está en oferta
  mercado_libre_url: string // NUEVO: URL de MercadoLibre
  display_price: number // CALCULADO: Precio a mostrar
  discount_percentage: number // CALCULADO: Porcentaje de descuento
  savings_amount: number // CALCULADO: Cantidad de ahorro
  imageUrl: string
  images?: string[]
  rating: number
  reviewCount: number
  altText: string
  category: ProductCategory
  brand: string
  sku: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  isTopPick: boolean
  specifications: object
  createdAt: string
  updatedAt: string
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
}

// ACTUALIZADA: Filtros con nuevo campo isOnSale
export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  isFeatured?: boolean
  isTopPick?: boolean
  isActive?: boolean
  isOnSale?: boolean // NUEVO: Filtrar por productos en oferta
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface FilterInfo {
  appliedFilters: Record<string, any>
  availableCategories: Array<{ id: string; name: string; count: number }>
  availableBrands: Array<{ name: string; count: number }>
  priceRange: { min: number; max: number }
}

// NUEVA: Interface para crear/actualizar productos
export interface CreateProductRequest {
  name: string
  description: string
  regular_price: number
  sale_price?: number
  is_on_sale?: boolean
  mercado_libre_url: string
  image_url: string
  images?: string[]
  alt_text: string
  category: { id: string } | string
  brand: string
  sku: string
  stock?: number
  is_active?: boolean
  is_featured?: boolean
  is_top_pick?: boolean
  specifications?: Record<string, any>
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}
