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