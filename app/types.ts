export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  brand?: string;
  createdAt?: Date;
}

export type ProductId = Product["id"];
