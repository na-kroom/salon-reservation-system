"use client";

import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/types/Product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/utils/productApi";

type ProductManagementProps = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

const categories: ProductCategory[] = [
  "スキンケア",
  "ヘアケア",
  "美容雑貨",
  "その他",
];

const ITEMS_PER_PAGE = 10;

export default function ProductManagement({
  products,
  setProducts,
}: ProductManagementProps) {
  const [activeTab, setActiveTab] = useState<"list" | "register">("list");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState<ProductCategory>("その他");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "すべて">("すべて");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // 新しく作成したプレビューURLを画面から離れるときに解放する
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setEditingProductId(null);
    setProductName("");
    setProductPrice("");
    setProductCategory("その他");
    setProductImage(null);
    setImagePreview(null);
    setOriginalImageUrl(null);
  };

  const handleOpenRegister = () => {
    resetForm();
    setActiveTab("register");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductCategory(product.category ?? "その他");
    setProductImage(null);
    setImagePreview(product.image_url ?? null);
    setOriginalImageUrl(product.image_url ?? null);
    setActiveTab("register");
  };

  const handleSelectImage = (file?: File) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("JPEG・PNG・WebP形式の画像を選択してください。");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("画像サイズは2MB以下にしてください。");
      return;
    }

    setProductImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async () => {
    const name = productName.trim();
    const price = Number(productPrice);

    if (!name || productPrice.trim() === "") {
      alert("商品名と価格を入力してください。");
      return;
    }

    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
      alert("価格は0以上の整数で入力してください。");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    let uploadedImageUrl: string | null = null;

    try {
      if (productImage) {
        uploadedImageUrl = await uploadProductImage(productImage);
      }

      // 新しい画像を選んでいなければ、既存画像URLを維持する。
      // 既存画像を削除した場合は imagePreview が null になる。
      const imageUrl = productImage
        ? uploadedImageUrl
        : imagePreview;

      if (editingProductId !== null) {
        const updatedProduct = await updateProduct(editingProductId, {
          name,
          price,
          category: productCategory,
          image_url: imageUrl,
        });

        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProductId ? updatedProduct : product
          )
        );

        if (originalImageUrl && originalImageUrl !== imageUrl) {
          try {
            await deleteProductImage(originalImageUrl);
          } catch (imageError) {
            console.error("古い商品画像の削除に失敗しました", imageError);
          }
        }

        alert("商品を更新しました。");
      } else {
        const newProduct = await createProduct({
          name,
          price,
          category: productCategory,
          image_url: imageUrl,
        });

        setProducts((prev) => [...prev, newProduct]);
        setSelectedCategory(productCategory);
        setCurrentPage(1);
        alert("商品を登録しました。");
      }

      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("商品登録・編集に失敗しました", error);
      alert("商品登録・編集に失敗しました。入力内容と通信状態を確認してください。");

      // DB保存に失敗した場合、今回アップロードした画像だけを後片付けする。
      if (uploadedImageUrl) {
        try {
          await deleteProductImage(uploadedImageUrl);
        } catch (cleanupError) {
          console.error("アップロード画像の後処理に失敗しました", cleanupError);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const targetProduct = products.find((product) => product.id === id);
    if (!targetProduct) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));

      if (targetProduct.image_url) {
        try {
          await deleteProductImage(targetProduct.image_url);
        } catch (imageError) {
          console.error("商品画像の削除に失敗しました", imageError);
          alert("商品は削除しましたが、画像ファイルの削除に失敗しました。");
        }
      }
    } catch (error) {
      console.error("商品削除に失敗しました", error);
      alert("商品削除に失敗しました。");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "すべて" ||
      (product.category ?? "その他") === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const firstItem = filteredProducts.length === 0
    ? 0
    : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProducts.length);

  const handleCategoryChange = (category: ProductCategory | "すべて") => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setProductSearch(value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* タブ */}
      <div className="flex items-end gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`rounded-t-xl border px-5 py-3 text-sm font-semibold transition ${
            activeTab === "list"
              ? "border-slate-200 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          商品一覧
        </button>
        <button
          type="button"
          onClick={handleOpenRegister}
          className={`rounded-t-xl border px-5 py-3 text-sm font-semibold transition ${
            activeTab === "register"
              ? "border-slate-200 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          ＋ 商品登録
        </button>
      </div>

      <div className="min-h-[300px] rounded-b-2xl rounded-tr-2xl border border-slate-200 border-t-0 bg-white p-6 shadow-sm">
        {activeTab === "list" && (
          <div>
            <div className="mt-0">
              <input
                id="product-search"
                type="text"
                placeholder="商品名で検索"
                value={productSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("すべて")}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    selectedCategory === "すべて"
                      ? "border-slate-800 bg-slate-800 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  すべて
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                      selectedCategory === category
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                            写真なし
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="break-words font-semibold text-slate-900">
                            {product.name}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            ¥{product.price.toLocaleString()}
                          </div>
                          <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                            {product.category ?? "その他"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`${product.name}を削除しますか？`)) {
                              void handleDeleteProduct(product.id);
                            }
                          }}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    該当する商品が見つかりません
                  </p>
                )}
              </div>

              {filteredProducts.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500">
                    全{filteredProducts.length}件中 {firstItem}〜{lastItem}件
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      前へ
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium ${
                          safeCurrentPage === page
                            ? "bg-slate-800 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "register" && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingProductId === null ? "商品登録" : "商品編集"}
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="product-name" className="mb-2 block text-sm font-medium text-slate-700">
                  商品名
                </label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="商品名を入力"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label htmlFor="product-price" className="mb-2 block text-sm font-medium text-slate-700">
                  価格（円）
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="価格を入力"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label htmlFor="product-category" className="mb-2 block text-sm font-medium text-slate-700">
                  商品分類
                </label>
                <select
                  id="product-category"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value as ProductCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 商品写真 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  商品写真
                </label>
                <div className="flex flex-wrap items-start gap-4">
                  {imagePreview ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="商品プレビュー"
                        className="h-32 w-32 rounded-xl border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProductImage(null);
                          setImagePreview(null);
                        }}
                        className="mt-2 text-sm text-rose-600 hover:text-rose-700"
                      >
                        写真を削除
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 transition hover:bg-slate-100">
                      <span className="text-2xl">＋</span>
                      <span className="mt-1">写真を選択</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          handleSelectImage(e.target.files?.[0]);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  JPEG・PNG・WebP形式、2MB以下
                </p>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => void handleAddProduct()}
                  disabled={isSaving}
                  className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "保存中..." : editingProductId === null ? "商品を登録" : "変更を保存"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("list");
                  }}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
