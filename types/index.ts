export interface ProductCategory {
  id: string
  name: string
  slug: string
  parentId?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
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
