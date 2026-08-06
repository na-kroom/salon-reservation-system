import { supabase } from "./supabase";

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("id");

  if (error) {
    throw error;
  }

  return data;
}