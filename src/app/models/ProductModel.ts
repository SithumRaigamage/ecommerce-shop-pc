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
  format?: string;
  category: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  orderCount?: number;
  colors?: string[];
  sizes?: Size[];
  
}
