export interface ProductConfiguration {
  setType: string;        // "3d-with-rims" | "classic"
  cellType: string;       // "diamonds" | "honey"
  setVariant: string;     // "front" | "basic" | "premium" | "complete"
  materialColor: string;  // kolor materiału
  edgeColor: string;      // kolor obszycia
  heelPad: string;        // "brak" | "tak"
}

export interface ProductPricing {
  basePrice: number;
  discount?: number;      // Kwota rabatu
  shippingCost?: number;  // Koszt wysyłki
  totalPrice: number;
}

export interface CarDetails {
  brand: string;
  model: string;
  year: string;
  bodyType?: string;
}

export interface Product {
  id: string;
  sessionId: string;
  name: string;
  image: string;
  configuration: ProductConfiguration;
  pricing: ProductPricing;
  carDetails?: CarDetails;
  status: 'cached';
  createdAt: Date;
}

export interface ConfigurationData {
  setType: string;
  cellType: string;
  setVariant: string;
  materialColor: string;
  edgeColor: string;
  heelPad: string;
  carDetails?: CarDetails;
}

















