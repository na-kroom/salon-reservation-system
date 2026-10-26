"use client";

import { useState } from "react";
import type {
  Product,
  ProductCategory,
} from "@/types/Product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/utils/productApi";

type ProductManagementProps = {
  products: Product[];
  setProducts: React.Dispatch<
    React.SetStateAction<Product[]>
  >;
};

const categories: ProductCategory[] = [
  "スキンケア",
  "ヘアケア",
  "美容雑貨",
  "その他",
];

export default function ProductManagement({
  products,
  setProducts,
}: ProductManagementProps) {
  const [activeTab, setActiveTab] = useState<
    "list" | "register"
  >("list");

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] =
    useState<ProductCategory>("その他");

  const [productSearch, setProductSearch] = useState("");
  const [showProductList, setShowProductList] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | "すべて">("すべて");

  const [editingProductId, setEditingProductId] =
    useState<number | null>(null);

  // フォームを初期状態に戻す
  const resetForm = () => {
    setEditingProductId(null);
    setProductName("");
    setProductPrice("");
    setProductCategory("その他");
  };

  // 新規登録画面を開く
  const handleOpenRegister = () => {
    resetForm();
    setActiveTab("register");
  };

  // 編集画面を開く
  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductCategory(product.category ?? "その他");
    setActiveTab("register");
  };

  // 商品登録・更新
  const handleAddProduct = async () => {
    const name = productName.trim();
    const price = Number(productPrice);

    if (!name || productPrice.trim() === "") {
      alert("商品名と価格を入力してください");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      alert("価格は0以上の数値を入力してください");
      return;
    }

    // 商品更新
    if (editingProductId !== null) {
      try {
        const updatedProduct = await updateProduct(
          editingProductId,
          {
            name,
            price,
            category: productCategory,
          }
        );

        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProductId
              ? updatedProduct
              : product
          )
        );

        alert("商品を更新しました");

        resetForm();
        setActiveTab("list");
        setShowProductList(true);
      } catch (error) {
        console.error("商品編集に失敗しました", error);
        alert("商品編集に失敗しました。");
      }

      return;
    }

    // 新規商品登録
    try {
      const newProduct = await createProduct({
        name,
        price,
        category: productCategory,
      });

      setProducts((prev) => [...prev, newProduct]);

      alert("商品を登録しました");

      resetForm();
      setActiveTab("list");
      setSelectedCategory(productCategory);
      setShowProductList(true);
    } catch (error) {
      console.error("商品登録に失敗しました", error);
      alert("商品登録に失敗しました。");
    }
  };

  // 商品削除
  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("商品削除に失敗しました", error);
      alert("商品削除に失敗しました。");
    }
  };

  // 商品一覧の絞り込み
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "すべて" ||
      (product.category ?? "その他") === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  // 一覧・分類ボタンの切り替え
  const handleSelectCategory = (
    category: ProductCategory | "すべて"
  ) => {
    if (
      showProductList &&
      selectedCategory === category
    ) {
      setShowProductList(false);
      return;
    }

    setSelectedCategory(category);
    setShowProductList(true);
  };

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`rounded-t-2xl border px-7 py-4 text-sm font-semibold transition ${
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
          className={`rounded-t-2xl border px-7 py-4 text-sm font-semibold transition ${
            activeTab === "register"
              ? "border-slate-200 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          ＋ 商品登録
        </button>
      </div>

      <div className="min-h-[300px] rounded-b-2xl rounded-tr-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* 商品一覧タブ */}
        {activeTab === "list" && (
          <div>
            {/* 商品検索 */}
            <div className="mt-6">
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                商品検索
              </label>

              <input
                id="product-search"
                type="text"
                placeholder="商品名で検索"
                value={productSearch}
                onChange={(e) =>
                  setProductSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* 商品一覧・分類ボタン */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectCategory("すべて")
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    showProductList &&
                    selectedCategory === "すべて"
                      ? "border-slate-800 bg-slate-800 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  商品一覧
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      handleSelectCategory(category)
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      showProductList &&
                      selectedCategory === category
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* ボタンを押したときだけ商品を表示 */}
              {showProductList && (
                <div className="mt-6 space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="break-words font-semibold text-slate-900">
                            {product.name}
                          </div>

                          <div className="mt-1 text-sm text-slate-600">
                            ¥{product.price.toLocaleString()}
                          </div>

                          <span className="mt-2 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700">
                            {product.category ?? "その他"}
                          </span>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditProduct(product)
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            編集
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `${product.name}を削除しますか？`
                                )
                              ) {
                                handleDeleteProduct(product.id);
                              }
                            }}
                            className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-100 hover:text-red-600"
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
              )}
            </div>
          </div>
        )}

        {/* 商品登録・編集タブ */}
        {activeTab === "register" && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {editingProductId === null
                ? "商品登録"
                : "商品編集"}
            </h2>

            <div className="mt-6 space-y-4">
              {/* 商品名 */}
              <div>
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  商品名
                </label>

                <input
                  id="product-name"
                  type="text"
                  placeholder="商品名を入力"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* 価格 */}
              <div>
                <label
                  htmlFor="product-price"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  価格（円）
                </label>

                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="価格を入力"
                  value={productPrice}
                  onChange={(e) =>
                    setProductPrice(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* 商品分類 */}
              <div>
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  商品分類
                </label>

                <select
                  id="product-category"
                  value={productCategory}
                  onChange={(e) =>
                    setProductCategory(
                      e.target.value as ProductCategory
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* 登録・保存ボタン */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {editingProductId === null
                    ? "商品を登録"
                    : "変更を保存"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("list");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
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