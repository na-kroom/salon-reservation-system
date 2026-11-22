import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";
import type { Customer } from "@/types/Customer";

type CustomerInput = {
  name: string;
  kana: string;
  phone: string;
  memo: string;
  isProvisional?: boolean;
  isArchived?: boolean;
  archivedAt?: string | null;
};

// Supabaseのデータをアプリ側の形式に変換
const mapCustomer = (data: any): Customer => ({
  id: data.id,
  name: data.name ?? "",
  kana: data.kana ?? "",
  phone: data.phone ?? "",
  memo: data.memo ?? "",
  visitCount: 0,
  isProvisional: data.is_provisional ?? false,
  isArchived: data.is_archived ?? false,
  archivedAt: data.archived_at ?? null,
});

// 顧客一覧取得
export async function fetchCustomers(): Promise<Customer[]> {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("shop_id", shopId)
    .order("id");

  if (error) throw error;

  return (data ?? []).map(mapCustomer);
}

// 顧客登録
export async function createCustomer(
  input: CustomerInput
): Promise<Customer> {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      shop_id: shopId,
      name: input.name,
      kana: input.kana,
      phone: input.phone,
      memo: input.memo,
      is_provisional: input.isProvisional ?? false,
      is_archived: input.isArchived ?? false,
      archived_at: input.archivedAt ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapCustomer(data);
}

// 顧客情報更新
export async function updateCustomer(
  id: number,
  input: CustomerInput
): Promise<Customer> {
  const shopId = await getCurrentShopId();

  const updateData: Record<string, any> = {
    name: input.name,
    kana: input.kana,
    phone: input.phone,
    memo: input.memo,
    updated_at: new Date().toISOString(),
  };

  if (input.isProvisional !== undefined) {
    updateData.is_provisional = input.isProvisional;
  }

  if (input.isArchived !== undefined) {
    updateData.is_archived = input.isArchived;
  }

  if (input.archivedAt !== undefined) {
    updateData.archived_at = input.archivedAt;
  }

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .eq("shop_id", shopId)
    .select()
    .single();

  if (error) throw error;

  return mapCustomer(data);
}

// 顧客削除
export async function deleteCustomer(id: number) {
  const shopId = await getCurrentShopId();

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw error;
}

// 顧客の個人情報を匿名化（予約履歴は保持）
export async function anonymizeCustomer(id: number): Promise<void> {
  const { error } = await supabase.rpc("anonymize_customer", {
    p_customer_id: id,
  });

  if (error) throw error;
}
