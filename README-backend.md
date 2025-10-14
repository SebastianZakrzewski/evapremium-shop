# Backend Services - EVA Website

## Overview

This document describes the backend services architecture for the EVA website. The backend is built with Next.js 14 App Router, TypeScript, and Supabase, following clean architecture principles.

## Architecture

```
src/lib/
├── services/           # Business logic layer
│   ├── AccessoryService.ts
│   ├── MatService.ts
│   ├── OrderService.ts
│   ├── CartService.ts
│   └── PricingService.ts
├── repositories/       # Data access layer
│   ├── BaseRepository.ts
│   ├── AccessoryRepository.ts
│   ├── MatRepository.ts
│   └── OrderRepository.ts
├── types/             # TypeScript type definitions
│   ├── accessory.ts
│   ├── mat.ts
│   ├── order-new.ts
│   └── cart-new.ts
├── validators/        # Zod validation schemas
│   ├── accessory.ts
│   ├── mat.ts
│   ├── order.ts
│   └── cart.ts
└── database/          # Database configuration
    └── supabase.ts
```

## Services

### AccessoryService
Manages car accessories (organizers, clips, etc.).

**Key Methods:**
- `getAccessories(filters?)` - Get all accessories with optional filters
- `getAccessoriesByCategory(categorySlug)` - Get accessories by category
- `getAccessoryById(id)` - Get accessory by ID
- `getAccessoryBySlug(slug)` - Get accessory by SEO-friendly slug
- `checkAvailability(id, quantity)` - Check if accessory is available
- `createAccessory(data)` - Create new accessory (Admin)
- `updateAccessory(id, data)` - Update accessory (Admin)
- `deleteAccessory(id)` - Delete accessory (Admin)

### MatService
Manages car mats with configuration options.

**Key Methods:**
- `findMatForCar(params)` - Find mat for specific car configuration
- `getAvailableMats(filters?)` - Get all available mats
- `getAvailableBodyTypes(brandSlug, modelSlug)` - Get available body types
- `getAvailableGenerations(brandSlug, modelSlug)` - Get available generations
- `validateConfiguration(mat, config)` - Validate mat configuration
- `calculatePrice(mat, config)` - Calculate price with configuration
- `createMat(data)` - Create new mat (Admin)
- `updateMat(id, data)` - Update mat (Admin)
- `deleteMat(id)` - Delete mat (Admin)

### OrderService
Handles order creation, updates, and status management.

**Key Methods:**
- `createOrder(data)` - Create new order
- `getOrderByNumber(orderNumber)` - Get order by order number
- `getCustomerOrders(email)` - Get orders by customer email
- `getOrdersByStatus(status)` - Get orders by status
- `updateOrderStatus(id, status, trackingNumber?)` - Update order status
- `getOrderStats()` - Get order statistics

### CartService
Manages shopping cart operations.

**Key Methods:**
- `addToCart(cart, item)` - Add item to cart
- `removeFromCart(cart, itemId)` - Remove item from cart
- `updateQuantity(cart, itemId, quantity)` - Update item quantity
- `clearCart()` - Clear entire cart
- `getCartSummary(cart)` - Get cart summary
- `isEmpty(cart)` - Check if cart is empty
- `getItemCount(cart)` - Get item count

### PricingService
Handles pricing calculations and discounts.

**Key Methods:**
- `calculateShippingCost(subtotal)` - Calculate shipping cost
- `calculateTax(amount)` - Calculate VAT tax
- `calculateMatPrice(basePrice, config)` - Calculate mat price with config
- `calculateSetVariantPrice(variantId, matTypeId, basePrice)` - Calculate set price
- `calculateOrderTotal(subtotal, shippingCost?, discount?)` - Calculate order total
- `validateDiscountCode(code, subtotal)` - Validate discount code
- `formatPrice(price)` - Format price for display

## Repositories

### BaseRepository
Common CRUD operations for all entities.

**Key Methods:**
- `findById(id)` - Find by ID
- `findMany(where?, options?)` - Find multiple records
- `create(data)` - Create new record
- `update(id, data)` - Update record
- `delete(id)` - Delete record
- `count(where?)` - Count records

### AccessoryRepository
Accessory-specific database operations.

**Key Methods:**
- `findByCategory(categorySlug)` - Find by category
- `findBySlug(slug)` - Find by slug
- `findBySku(sku)` - Find by SKU
- `decrementStock(id, quantity)` - Decrement stock quantity

### MatRepository
Mat-specific database operations.

**Key Methods:**
- `findByCarDetails(params)` - Find by car details
- `findByBrandAndModel(brandSlug, modelSlug)` - Find by brand and model
- `findAvailableBodyTypes(brandSlug, modelSlug)` - Find available body types
- `findAvailableGenerations(brandSlug, modelSlug)` - Find available generations

### OrderRepository
Order-specific database operations.

**Key Methods:**
- `findByOrderNumber(orderNumber)` - Find by order number
- `findByCustomerEmail(email)` - Find by customer email
- `findByStatus(status)` - Find by status
- `updateStatus(id, status, trackingNumber?)` - Update status
- `countOrdersThisYear()` - Count orders this year
- `getOrderStats()` - Get order statistics

## API Endpoints

### Accessories
- `GET /api/accessories` - Get all accessories
- `GET /api/accessories/[id]` - Get accessory by ID
- `GET /api/accessories/slug/[slug]` - Get accessory by slug
- `POST /api/accessories` - Create accessory (Admin)
- `PUT /api/accessories/[id]` - Update accessory (Admin)
- `DELETE /api/accessories/[id]` - Delete accessory (Admin)

### Mats
- `GET /api/mats` - Get all mats
- `POST /api/mats/find` - Find mat for car
- `GET /api/mats/body-types` - Get available body types
- `POST /api/mats` - Create mat (Admin)

### Orders
- `GET /api/orders` - Get orders with filters
- `POST /api/orders` - Create order
- `GET /api/orders/[orderNumber]` - Get order by number
- `PUT /api/orders/[orderNumber]` - Update order status

### Cart
- `POST /api/cart` - Perform cart operations
- `GET /api/cart?action=summary` - Get cart summary

## Data Models

### Accessory
```typescript
interface Accessory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sku: string;
  imageSrc?: string;
  features: string[];
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  rating?: number;
  reviewCount: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mat
```typescript
interface Mat {
  id: string;
  carBrandSlug: string;
  carModelSlug: string;
  generation?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  basePrice: number;
  availableSetTypes: string[];
  availableCellTypes: string[];
  availableColors: string[];
  availableEdgeColors: string[];
  hasHeelPad: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  customer: CustomerData;
  shippingAddress: AddressData;
  billingAddress?: AddressData;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Examples

### Basic Usage
```typescript
import { AccessoryService, MatService, OrderService } from '@/lib/services';

// Get accessories
const accessoryService = new AccessoryService();
const accessories = await accessoryService.getAccessories();

// Find mats for car
const matService = new MatService();
const mat = await matService.findMatForCar({
  brandSlug: 'bmw',
  modelSlug: '3-series',
  generation: 'F30',
  bodyType: 'sedan'
});

// Create order
const orderService = new OrderService();
const order = await orderService.createOrder(orderData);
```

### Error Handling
```typescript
try {
  const accessory = await accessoryService.getAccessoryById('invalid-id');
  if (!accessory) {
    console.log('Accessory not found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

### Validation
```typescript
import { CreateOrderSchema } from '@/lib/validators';

const orderData = {
  customer: { name: 'John Doe', email: 'john@example.com', phone: '123456789' },
  shippingAddress: { street: 'Main St', city: 'Warsaw', postalCode: '00-001', country: 'Poland' },
  paymentMethod: 'card',
  items: [/* ... */]
};

const validatedData = CreateOrderSchema.parse(orderData);
```

## Database Schema

The backend uses the following main tables:

- `accessory_categories` - Product categories
- `accessories` - Car accessories
- `mats` - Car mats with configuration
- `orders` - Customer orders
- `order_items` - Order line items

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string

## Testing

To test the backend services:

1. Start the development server: `npm run dev`
2. Use the examples in `examples/backend-usage.ts`
3. Test API endpoints with Postman or curl
4. Check Supabase dashboard for data

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

## Contributing

When adding new features:

1. Follow the existing architecture patterns
2. Add proper TypeScript types
3. Include Zod validation schemas
4. Write comprehensive tests
5. Update documentation

## Support

For questions or issues:
1. Check the API documentation in `docs/api-backend.md`
2. Review the usage examples in `examples/backend-usage.ts`
3. Check the Supabase dashboard for data issues
4. Review the console logs for error details
