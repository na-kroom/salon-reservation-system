import { supabase } from "./supabase";

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
  const { data, error } = await supabase
    .from("products")
    .insert({
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