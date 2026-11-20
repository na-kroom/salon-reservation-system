import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";
import type { Customer } from "@/types/Customer";

function mapCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name ?? "",
    kana: row.kana ?? "",
    phone: row.phone ?? "",
    visitCount: row.visit_count ?? 0,
    memo: row.memo ?? "",
    isProvisional: Boolean(row.is_provisional),
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const shopId = await getCurrentShopId();
  const { data, error } = await supabase.from("customers").select("*").eq("shop_id", shopId).order("id");
  if (error) throw error;
  return (data ?? []).map(mapCustomer);
}

type CustomerInput = { name: string; kana?: string; phone?: string; memo?: string; isProvisional?: boolean };

export async function createCustomer({ name, kana = "", phone = "", memo = "", isProvisional = false }: CustomerInput): Promise<Customer> {
  const shopId = await getCurrentShopId();
  const { data, error } = await supabase.from("customers").insert({
    shop_id: shopId, name, kana, phone, memo, is_provisional: isProvisional,
  }).select().single();
  if (error) throw error;
  return mapCustomer(data);
}

export async function updateCustomer(id: number, { name, kana = "", phone = "", memo = "", isProvisional }: CustomerInput): Promise<Customer> {
  const shopId = await getCurrentShopId();
  const updates: Record<string, unknown> = { name, kana, phone, memo };
  if (isProvisional !== undefined) updates.is_provisional = isProvisional;
  const { data, error } = await supabase.from("customers").update(updates).eq("id", id).eq("shop_id", shopId).select().single();
  if (error) throw error;
  return mapCustomer(data);
}

export async function deleteCustomer(id: number) {
  const shopId = await getCurrentShopId();
  const { error } = await supabase.from("customers").delete().eq("id", id).eq("shop_id", shopId);
  if (error) throw error;
}
