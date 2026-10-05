import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
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
  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      price,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}