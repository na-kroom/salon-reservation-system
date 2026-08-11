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

export async function createCustomer({
  name,
  kana,
  phone,
  memo,
}: {
  name: string;
  kana: string;
  phone: string;
  memo: string;
}) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      kana,
      phone,
      memo,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
export async function updateCustomer(
  id: number,
  {
    name,
    kana,
    phone,
    memo,
  }: {
    name: string;
    kana: string;
    phone: string;
    memo: string;
  }
) {
  const { data, error } = await supabase
    .from("customers")
    .update({
      name,
      kana,
      phone,
      memo,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}