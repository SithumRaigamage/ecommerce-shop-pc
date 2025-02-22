export interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: {
    text: string;
    color: string;
  };
}
