# Tech Emporium API Documentation

## 📋 Información General

- **Base URL**: `https://tu-deployment-url.vercel.app/v1`
- **Formato**: JSON
- **Codificación**: UTF-8
- **Autenticación**: No requerida (por ahora)

## 🛍️ Endpoints de Productos

### GET /products
**Descripción**: Obtener lista paginada de productos con filtros avanzados

**Query Parameters**:
\`\`\`
page?: number = 1              // Página (mínimo 1)
limit?: number = 12            // Items por página (máximo 50)
category?: string              // ID o slug de categoría
brand?: string                 // Nombre de marca
minPrice?: number              // Precio mínimo
maxPrice?: number              // Precio máximo
search?: string                // Búsqueda por nombre/descripción
sortBy?: string = 'created_at' // Campo de ordenamiento
sortOrder?: 'asc' | 'desc' = 'desc'
isFeatured?: boolean           // Solo productos destacados
isTopPick?: boolean            // Solo productos recomendados
isActive?: boolean = true      // Solo productos activos
\`\`\`

**Ejemplo de Request**:
\`\`\`bash
GET /v1/products?page=1&limit=12&category=gaming&isFeatured=true
\`\`\`

**Response 200**:
\`\`\`json
{
  "data": {
    "products": [
      {
        "id": "uuid-1",
        "name": "Audífonos Inalámbricos con Cancelación de Ruido Premium",
        "description": "Experiencia de sonido inmersiva...",
        "price": 199.99,
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90"
        ],
        "rating": 4.5,
        "reviewCount": 2,
        "altText": "Audífonos inalámbricos premium",
        "category": {
          "id": "cat-1",
          "name": "Audio",
          "slug": "audio"
        },
        "brand": "TechBrand",
        "sku": "TB-WH-001",
        "stock": 50,
        "isActive": true,
        "isFeatured": true,
        "isTopPick": false,
        "specifications": {
          "connectivity": "Bluetooth 5.3",
          "batteryLife": "30 hours",
          "noiseCancellation": "Active ANC",
          "weight": "250g"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 120,
      "itemsPerPage": 12,
      "hasNext": true,
      "hasPrevious": false
    },
    "filters": {
      "appliedFilters": {
        "category": "gaming",
        "isFeatured": true
      },
      "availableCategories": [
        {"id": "cat-1", "name": "Audio", "count": 45},
        {"id": "cat-2", "name": "Gaming", "count": 30}
      ],
      "availableBrands": [
        {"name": "TechBrand", "count": 25},
        {"name": "GamePro", "count": 20}
      ],
      "priceRange": {
        "min": 29.99,
        "max": 1999.99
      }
    }
  },
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

### GET /products/:id
**Descripción**: Obtener producto específico por ID

**Parameters**:
- `id` (string, required): UUID del producto

**Ejemplo de Request**:
\`\`\`bash
GET /v1/products/123e4567-e89b-12d3-a456-426614174000
\`\`\`

**Response 200**:
\`\`\`json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Laptop Gaming RGB Pro 15.6\" - RTX 4060",
    "description": "Potente laptop gaming diseñada para los jugadores más exigentes...",
    "price": 1299.99,
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
    "images": [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    ],
    "rating": 4.5,
    "reviewCount": 2,
    "altText": "Laptop gaming profesional con teclado RGB",
    "category": {
      "id": "cat-2",
      "name": "Computación",
      "slug": "computacion"
    },
    "brand": "GamePro",
    "sku": "GP-LT-002",
    "stock": 15,
    "isActive": true,
    "isFeatured": true,
    "isTopPick": true,
    "specifications": {
      "processor": "Intel Core i7-12700H",
      "ram": "16GB DDR4 3200MHz",
      "storage": "512GB NVMe SSD",
      "graphics": "NVIDIA RTX 4060 8GB",
      "display": "15.6\" FHD 144Hz IPS"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

**Response 404**:
\`\`\`json
{
  "success": false,
  "message": "Product not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

### POST /products
**Descripción**: Crear nuevo producto (Admin)

**Request Body**:
\`\`\`json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 299.99,
  "imageUrl": "https://example.com/image.jpg",
  "images": ["https://example.com/image1.jpg"],
  "altText": "Texto alternativo",
  "category": {
    "id": "cat-1"
  },
  "brand": "MarcaEjemplo",
  "sku": "SKU-001",
  "stock": 100,
  "isActive": true,
  "isFeatured": false,
  "isTopPick": false,
  "specifications": {
    "color": "Negro",
    "weight": "500g"
  }
}
\`\`\`

**Response 201**:
\`\`\`json
{
  "data": {
    "id": "nuevo-uuid",
    "name": "Nuevo Producto",
    // ... resto de campos
  },
  "success": true,
  "message": "Product created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

### PUT /products/:id
**Descripción**: Actualizar producto existente (Admin)

**Parameters**:
- `id` (string, required): UUID del producto

**Request Body** (campos opcionales):
\`\`\`json
{
  "name": "Nombre actualizado",
  "price": 399.99,
  "stock": 75,
  "isFeatured": true
}
\`\`\`

**Response 200**:
\`\`\`json
{
  "data": {
    "id": "uuid",
    "name": "Nombre actualizado",
    // ... resto de campos actualizados
  },
  "success": true,
  "message": "Product updated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

### DELETE /products/:id
**Descripción**: Eliminar producto (Admin)

**Parameters**:
- `id` (string, required): UUID del producto

**Response 200**:
\`\`\`json
{
  "success": true,
  "message": "Product deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

## 🔍 Ejemplos de Uso Prácticos

### JavaScript/Fetch
\`\`\`javascript
// Obtener todos los productos
const response = await fetch('https://tu-api.vercel.app/v1/products');
const data = await response.json();
console.log(data.data.products);

// Buscar productos
const searchResponse = await fetch('https://tu-api.vercel.app/v1/products?search=laptop&limit=5');
const searchData = await searchResponse.json();

// Filtrar por categoría y precio
const filteredResponse = await fetch('https://tu-api.vercel.app/v1/products?category=gaming&minPrice=100&maxPrice=500');
const filteredData = await filteredResponse.json();

// Obtener producto específico
const productResponse = await fetch('https://tu-api.vercel.app/v1/products/uuid-del-producto');
const product = await productResponse.json();
\`\`\`

### cURL
\`\`\`bash
# Obtener productos
curl -X GET "https://tu-api.vercel.app/v1/products?page=1&limit=10"

# Buscar productos
curl -X GET "https://tu-api.vercel.app/v1/products?search=gaming&isFeatured=true"

# Obtener producto por ID
curl -X GET "https://tu-api.vercel.app/v1/products/123e4567-e89b-12d3-a456-426614174000"

# Crear producto (POST)
curl -X POST "https://tu-api.vercel.app/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción",
    "price": 199.99,
    "imageUrl": "https://example.com/image.jpg",
    "altText": "Alt text",
    "category": {"id": "cat-1"},
    "brand": "Marca",
    "sku": "SKU-001",
    "stock": 50
  }'
\`\`\`

### Python/Requests
```python
import requests

# Obtener productos
response = requests.get('https://tu-api.vercel.app/v1/products')
products = response.json()['data']['products']

# Filtrar productos
params = {
    'category': 'gaming',
    'minPrice': 100,
    'maxPrice': 500,
    'isFeatured': True
}
filtered_response = requests.get('https://tu-api.vercel.app/v1/products', params=params)
filtered_products = filtered_response.json()['data']['products']

# Obtener producto específico
product_id = "123e4567-e89b-12d3-a456-426614174000"
product_response = requests.get(f'https://tu-api.vercel.app/v1/products/{product_id}')
product = product_response.json()['data']
