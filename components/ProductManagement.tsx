import { useState } from "react";
import type { Product } from "@/types/Product";
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

export default function ProductManagement({
  products,
  setProducts,
}: ProductManagementProps) {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [editingProductId, setEditingProductId] =
    useState<number | null>(null);

  const handleAddProduct = async () => {
    if (!productName || !productPrice) {
      alert("商品名と価格を入力してください");
      return;
    }

    if (editingProductId !== null) {
      try {
        const updatedProduct = await updateProduct(
          editingProductId,
          {
            name: productName,
            price: Number(productPrice),
          }
        );

        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProductId
              ? updatedProduct
              : product
          )
        );
      } catch (error) {
        console.error(
          "商品編集に失敗しました",
          error
        );
        alert("商品編集に失敗しました。");
        return;
      }

      setEditingProductId(null);
      setProductName("");
      setProductPrice("");

      return;
    }

    try {
      const newProduct = await createProduct({
        name: productName,
        price: Number(productPrice),
      });

      setProducts((prev) => [
        ...prev,
        newProduct,
      ]);
    } catch (error) {
      console.error(
        "商品登録に失敗しました",
        error
      );
      alert("商品登録に失敗しました。");
      return;
    }

    setProductName("");
    setProductPrice("");
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error(
        "商品削除に失敗しました",
        error
      );
      alert("商品削除に失敗しました。");
      return;
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(productSearch.toLowerCase().trim())
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* 商品登録 */}
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        商品登録
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        商品情報を登録・編集できます
      </p>

      <div className="mt-6 space-y-3">
        <input
          type="text"
          placeholder="商品名"
          value={productName}
          onChange={(e) =>
            setProductName(e.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="number"
          placeholder="価格"
          value={productPrice}
          onChange={(e) =>
            setProductPrice(e.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <button
          onClick={handleAddProduct}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          {editingProductId === null
            ? "商品登録"
            : "保存"}
        </button>
      </div>

      <hr className="my-8 border-slate-200" />

      {/* 商品検索 */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          商品検索
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          商品名から検索できます
        </p>

        <input
          type="text"
          placeholder="商品名で検索"
          value={productSearch}
          onChange={(e) =>
            setProductSearch(e.target.value)
          }
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <button
        type="button"
        onClick={() =>
          setShowProductList((prev) => !prev)
        }
        className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        {showProductList ? "商品一覧を閉じる" : "商品一覧"}
      </button>
      {/* 商品一覧 */}
      {showProductList && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            商品一覧
          </h3>

          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-slate-900">
                      {product.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      ¥{product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductName(product.name);
                        setProductPrice(
                          product.price.toString()
                        );
                      }}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      編集
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `${product.name}を削除しますか？`
                          )
                        ) {
                          handleDeleteProduct(product.id);
                        }
                      }}
                      className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 検索結果 */}
      {productSearch.trim() !== "" && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            検索結果
          </h3>

          <div className="mt-4 space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-slate-900">
                      {product.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      ¥{product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductName(product.name);
                        setProductPrice(
                          product.price.toString()
                        );
                      }}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      編集
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `${product.name}を削除しますか？`
                          )
                        ) {
                          handleDeleteProduct(product.id);
                        }
                      }}
                      className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                該当する商品が見つかりません
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}