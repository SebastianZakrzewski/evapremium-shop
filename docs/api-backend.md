# Backend API Documentation

## Overview

This document describes the backend API for the EVA website, built with Next.js 14 App Router and TypeScript. The API follows RESTful principles and uses Supabase as the database.

## Architecture

### Services Layer
- **AccessoryService**: Manages car accessories (organizers, clips, etc.)
- **MatService**: Manages car mats with configuration options
- **OrderService**: Handles order creation, updates, and status management
- **CartService**: Manages shopping cart operations
- **PricingService**: Handles pricing calculations and discounts

### Repository Layer
- **BaseRepository**: Common CRUD operations
- **AccessoryRepository**: Accessory-specific database operations
- **MatRepository**: Mat-specific database operations
- **OrderRepository**: Order-specific database operations

### Data Validation
- All endpoints use Zod schemas for request validation
- TypeScript types ensure type safety across the application

## API Endpoints

### Accessories

#### GET /api/accessories
Get all accessories with optional filters.

**Query Parameters:**
- `category` (string): Filter by category slug
- `inStock` (boolean): Filter by stock availability
- `priceMin` (number): Minimum price filter
- `priceMax` (number): Maximum price filter
- `orderBy` (string): Sort by field (name, price, rating, createdAt)
- `orderDirection` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Organizer Bagażnikowy",
      "slug": "organizer-bagaznikowy",
      "price": 149.99,
      "sku": "ORG-001",
      "inStock": true,
      "stockQuantity": 50,
      "categoryId": 1,
      "features": ["Wodoodporny", "Regulowane przegródki"],
      "rating": 4.5,
      "reviewCount": 25
    }
  ],
  "count": 1
}
```

#### GET /api/accessories/[id]
Get accessory by ID.

#### GET /api/accessories/slug/[slug]
Get accessory by slug (SEO-friendly URL).

#### POST /api/accessories
Create new accessory (Admin only).

**Request Body:**
```json
{
  "name": "Organizer Bagażnikowy",
  "price": 149.99,
  "categoryId": 1,
  "features": ["Wodoodporny", "Regulowane przegródki"],
  "inStock": true,
  "stockQuantity": 50
}
```

#### PUT /api/accessories/[id]
Update accessory (Admin only).

#### DELETE /api/accessories/[id]
Delete accessory (Admin only).

### Mats

#### GET /api/mats
Get all mats with optional filters.

**Query Parameters:**
- `brandSlug` (string): Filter by car brand
- `modelSlug` (string): Filter by car model
- `generation` (string): Filter by generation
- `bodyType` (string): Filter by body type
- `yearFrom` (number): Filter by minimum year
- `yearTo` (number): Filter by maximum year
- `isActive` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "carBrandSlug": "bmw",
      "carModelSlug": "3-series",
      "generation": "F30",
      "bodyType": "sedan",
      "yearFrom": 2012,
      "yearTo": 2018,
      "basePrice": 299.99,
      "availableSetTypes": ["front", "basic", "premium", "complete"],
      "availableCellTypes": ["diamonds", "honey"],
      "availableColors": ["black", "gray", "brown"],
      "availableEdgeColors": ["black", "gray", "red"],
      "hasHeelPad": true,
      "isActive": true
    }
  ],
  "count": 1
}
```

#### POST /api/mats/find
Find mat for specific car configuration.

**Request Body:**
```json
{
  "brandSlug": "bmw",
  "modelSlug": "3-series",
  "generation": "F30",
  "bodyType": "sedan"
}
```

#### GET /api/mats/body-types
Get available body types for brand and model.

**Query Parameters:**
- `brandSlug` (string): Car brand slug
- `modelSlug` (string): Car model slug

**Response:**
```json
{
  "success": true,
  "data": ["sedan", "wagon", "coupe"]
}
```

#### POST /api/mats
Create new mat (Admin only).

### Orders

#### GET /api/orders
Get orders with filters.

**Query Parameters:**
- `email` (string): Get orders by customer email
- `status` (string): Get orders by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-2024-000001",
      "status": "pending",
      "paymentStatus": "pending",
      "customer": {
        "name": "Jan Kowalski",
        "email": "jan@example.com",
        "phone": "123456789"
      },
      "shippingAddress": {
        "street": "ul. Przykładowa 1",
        "city": "Warszawa",
        "postalCode": "00-001",
        "country": "Polska"
      },
      "subtotal": 449.99,
      "shippingCost": 15.00,
      "tax": 106.99,
      "total": 571.98,
      "items": [
        {
          "id": "uuid",
          "quantity": 1,
          "unitPrice": 299.99,
          "subtotal": 299.99,
          "productType": "mat",
          "productId": "uuid",
          "productName": "Dywaniki BMW 3 Series F30",
          "configuration": {
            "carDetails": {
              "brand": "BMW",
              "model": "3 Series",
              "generation": "F30",
              "year": 2015
            },
            "setType": "premium",
            "cellType": "diamonds",
            "materialColor": "black",
            "edgeColor": "gray",
            "heelPad": "yes"
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### POST /api/orders
Create new order.

**Request Body:**
```json
{
  "customer": {
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "phone": "123456789"
  },
  "shippingAddress": {
    "street": "ul. Przykładowa 1",
    "city": "Warszawa",
    "postalCode": "00-001",
    "country": "Polska"
  },
  "paymentMethod": "card",
  "items": [
    {
      "quantity": 1,
      "unitPrice": 299.99,
      "subtotal": 299.99,
      "productType": "mat",
      "productId": "uuid",
      "productName": "Dywaniki BMW 3 Series F30",
      "configuration": {
        "carDetails": {
          "brand": "BMW",
          "model": "3 Series",
          "generation": "F30",
          "year": 2015
        },
        "setType": "premium",
        "cellType": "diamonds",
        "materialColor": "black",
        "edgeColor": "gray",
        "heelPad": "yes"
      }
    }
  ]
}
```

#### GET /api/orders/[orderNumber]
Get order by order number.

#### PUT /api/orders/[orderNumber]
Update order status.

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

### Cart

#### POST /api/cart
Perform cart operations.

**Request Body:**
```json
{
  "action": "add",
  "cart": {
    "items": [],
    "subtotal": 0,
    "shippingCost": 0,
    "tax": 0,
    "discount": 0,
    "total": 0,
    "itemCount": 0
  },
  "productType": "accessory",
  "productId": "uuid",
  "quantity": 1
}
```

**Actions:**
- `add`: Add item to cart
- `remove`: Remove item from cart
- `update`: Update item quantity
- `clear`: Clear entire cart

#### GET /api/cart?action=summary
Get cart summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "itemCount": 2,
    "subtotal": 449.99,
    "shippingCost": 15.00,
    "tax": 106.99,
    "discount": 0,
    "total": 571.98
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

Currently, the API does not implement authentication. All endpoints are publicly accessible. In production, you should add:

1. JWT token validation
2. Role-based access control (Admin vs Customer)
3. Rate limiting
4. CORS configuration

## Rate Limiting

Consider implementing rate limiting to prevent abuse:
- 100 requests per minute per IP
- 1000 requests per hour per IP

## Database Schema

The API uses the following main tables:
- `accessory_categories`: Product categories
- `accessories`: Car accessories
- `mats`: Car mats with configuration
- `orders`: Customer orders
- `order_items`: Order line items

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `DATABASE_URL`: PostgreSQL connection string

## Testing

To test the API endpoints:

1. Start the development server: `npm run dev`
2. Use tools like Postman or curl to test endpoints
3. Check the browser console for detailed error messages
4. Verify data in Supabase dashboard

## Future Enhancements

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - User management

2. **Advanced Features**
   - Search and filtering
   - Pagination
   - Caching with Redis
   - Webhook support

3. **Monitoring**
   - Request logging
   - Performance metrics
   - Error tracking

4. **Security**
   - Input sanitization
   - SQL injection prevention
   - XSS protection
