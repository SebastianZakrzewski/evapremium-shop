export interface CarouselItem {
  id: number;
  name: string;
  imageSrc: string;
  description?: string;
  subtitle?: string;
}

export interface ImageCarouselProps<T> {
  items: T[];
  className?: string;
  onItemClick?: (item: T) => void;
  renderItem?: (item: T, index: number, position: string) => React.ReactNode;
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
  description?: string;
}

export interface Model {
  id: number;
  name: string;
  brand: string;
  year: number;
  imageSrc: string;
  price?: string;
  description?: string;
} 