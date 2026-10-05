import { supabase } from "./supabase";

export async function getCurrentShopId(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("ログインユーザーが見つかりません。");
  }

  const { data, error } = await supabase
    .from("shop_members")
    .select("shop_id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data.shop_id;
}