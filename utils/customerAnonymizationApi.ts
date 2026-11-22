import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";

export type AnonymizationReview = {
  customerId: number;
  reviewedLastVisit: string;
  reviewedAt: string;
};

// 確認履歴を取得
export async function fetchAnonymizationReviews(): Promise<
  AnonymizationReview[]
> {
  const shopId = await getCurrentShopId();

  const { data, error } = await supabase
    .from("customer_anonymization_reviews")
    .select("customer_id, reviewed_last_visit, reviewed_at")
    .eq("shop_id", shopId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    customerId: row.customer_id,
    reviewedLastVisit: row.reviewed_last_visit,
    reviewedAt: row.reviewed_at,
  }));
}

// 確認履歴を保存・更新
export async function saveAnonymizationReview(
  customerId: number,
  lastVisit: string
): Promise<void> {
  const shopId = await getCurrentShopId();

  const { error } = await supabase
    .from("customer_anonymization_reviews")
    .upsert(
      {
        shop_id: shopId,
        customer_id: customerId,
        reviewed_last_visit: lastVisit,
        reviewed_at: new Date().toISOString(),
      },
      {
        onConflict: "shop_id,customer_id",
      }
    );

  if (error) throw error;
}