import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";

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
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      shop_id: shopId,
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

export async function deleteCustomer(id: number) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}