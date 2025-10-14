// New types
export * from './accessory';
export * from './mat';

// New types with aliases to avoid conflicts
export type { Order as OrderV2, OrderItem, CustomerData as CustomerDataV2, AddressData, OrderStatus as OrderStatusV2, PaymentStatus, CreateOrderDTO, CreateOrderItemDTO } from './order-new';
export type { Cart as CartV2, CartItem as CartItemV2, AddToCartDTO, UpdateCartItemDTO } from './cart-new';

// Legacy types (for backward compatibility)
export * from './product';
export * from './order';
export * from './cart';
export * from './configurator';
export * from './bitrix';
export * from './lead';

// Car model types with aliases to avoid conflicts
export type { CarBrand as CarBrandV2, CarModel as CarModelV2, BodyType as BodyTypeV2 } from './car-model';
export * from './api';
