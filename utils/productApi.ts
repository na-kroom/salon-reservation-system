import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";
import type { Product, ProductCategory } from "@/types/Product";

export async function fetchProducts(): Promise<Product[]> {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .order("id");

  if (error) {
    throw error;
  }

  return (data ?? []).map((product) => ({
    ...product,
    category: product.category ?? "その他",
  })) as Product[];
}

export async function createProduct({
  name,
  price,
  category,
}: {
  name: string;
  price: number;
  category: ProductCategory;
}): Promise<Product> {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("products")
    .insert({
      shop_id: shopId,
      name,
      price,
      category,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function updateProduct(
  id: number,
  {
    name,
    price,
    category,
  }: {
    name: string;
    price: number;
    category: ProductCategory;
  }
): Promise<Product> {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      price,
      category,
    })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(id: number) {
  const shopId = await getCurrentShopId();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) {
    throw error;
  }
}