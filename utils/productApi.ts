import { supabase } from "./supabase";
import { getCurrentShopId } from "./shop";
import type { Product, ProductCategory } from "@/types/Product";

const BUCKET_NAME = "product-images";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** 商品画像をSupabase Storageへアップロードし、公開URLを返す */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("JPEG・PNG・WebP形式の画像を選択してください。");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("画像サイズは2MB以下にしてください。");
  }

  const shopId = await getCurrentShopId();
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const filePath = `${shopId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/** 公開URLからStorage内のパスを取り出す */
function getProductImagePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

/** 商品画像をStorageから削除 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  const filePath = getProductImagePath(imageUrl);
  if (!filePath) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  if (error) throw error;
}

/** 商品一覧を取得 */
export async function fetchProducts(): Promise<Product[]> {
  const shopId = await getCurrentShopId();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    category: row.category ?? "その他",
    image_url: row.image_url ?? null,
  })) as Product[];
}

type ProductInput = {
  name: string;
  price: number;
  category: ProductCategory;
  image_url?: string | null;
};

/** 商品を登録 */
export async function createProduct(input: ProductInput): Promise<Product> {
  const shopId = await getCurrentShopId();
  const { data, error } = await supabase
    .from("products")
    .insert({
      shop_id: shopId,
      name: input.name,
      price: input.price,
      category: input.category,
      image_url: input.image_url ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return {
    ...data,
    category: data.category ?? "その他",
    image_url: data.image_url ?? null,
  } as Product;
}

/** 商品情報を更新 */
export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  const shopId = await getCurrentShopId();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      price: input.price,
      category: input.category,
      image_url: input.image_url ?? null,
    })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select("*")
    .single();

  if (error) throw error;
  return {
    ...data,
    category: data.category ?? "その他",
    image_url: data.image_url ?? null,
  } as Product;
}

/** 商品を削除（画像ファイルは呼び出し元で削除） */
export async function deleteProduct(id: number): Promise<void> {
  const shopId = await getCurrentShopId();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw error;
}




