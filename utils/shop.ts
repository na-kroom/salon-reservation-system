import { supabase } from "./supabase";

export async function getCurrentShopId(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("ユーザー情報を取得できませんでした");
  }

  const { data, error } = await supabase
    .from("shop_members")
    .select("shop_id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    throw new Error("所属店舗を取得できませんでした");
  }

  return data.shop_id;
}
export async function getCurrentShop() {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();

  if (error || !data) {
    console.error("店舗情報取得エラー:", error);
    throw new Error("店舗情報を取得できませんでした");
  }

  return {
    id: data.id,
    name: data.name,
    phone: data.phone ?? "",
    address: data.address ?? "",
    created_at: data.created_at,
  };
}