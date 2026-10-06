import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";

export async function fetchProducts() {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .order("id");

  if (error) {
    throw error;
  }

  return data;
}

export async function createProduct({
  name,
  price,
}: {
  name: string;
  price: number;
}) {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("products")
    .insert({
      shop_id: shopId,
      name,
      price,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(
  id: number,
  {
    name,
    price,
  }: {
    name: string;
    price: number;
  }
) {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      price,
    })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
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