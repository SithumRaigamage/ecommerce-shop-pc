export interface Size {
  name: string;
  description: string;
}

export interface ProductModel {
  id: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  colors?: string[];
  sizes?: Size[];
  rating?: number;
  reviewCount?: number;
  orderCount?: number;
  description?: string;
}
