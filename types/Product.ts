export type ProductCategory =
  | "スキンケア"
  | "ヘアケア"
  | "美容雑貨"
  | "その他";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
};