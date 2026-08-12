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