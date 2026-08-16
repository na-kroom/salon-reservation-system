import React from "react";
import type { Product } from "@/types/Product";
import {createProduct,updateProduct,} from "@/utils/productApi";

type ProductManagementProps = {
  products: Product[];

  productName: string;
  setProductName: React.Dispatch<
    React.SetStateAction<string>
  >;

  productPrice: string;
  setProductPrice: React.Dispatch<
    React.SetStateAction<string>
  >;

  setProducts: React.Dispatch<
    React.SetStateAction<Product[]>
  >;
  editingProductId: number | null;

    setEditingProductId: React.Dispatch<
    React.SetStateAction<number | null>
    >;
};

export default function ProductManagement({
    products,
    productName,
    setProductName,
    productPrice,
    setProductPrice,
    setProducts,
    editingProductId,
    setEditingProductId,
}: ProductManagementProps) {
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

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="mb-6 border p-4">
      <h2 className="font-bold text-lg mb-2">
        商品一覧
      </h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="商品名"
          value={productName}
          onChange={(e) =>
            setProductName(e.target.value)
          }
          className="border p-2 mr-2"
        />

        <input
          type="number"
          placeholder="価格"
          value={productPrice}
          onChange={(e) =>
            setProductPrice(e.target.value)
          }
          className="border p-2 mr-2"
        />

        <button
          onClick={handleAddProduct}
          className="bg-black text-white px-4 py-2 rounded"
        >
        {editingProductId === null
          ? "商品追加"
          : "保存"}
        </button>
      </div>

      {products.map((product) => (
        <div
          key={product.id}
          className="border-b py-2 flex justify-between items-center"
        >
          <span>
            {product.name}
            （¥{product.price.toLocaleString()}）
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingProductId(product.id);
                setProductName(product.name);
                setProductPrice(product.price.toString());
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              編集
            </button>

            <button
              onClick={() => {
                if (
                  confirm(`${product.name}を削除しますか？`)
                ) {
                  handleDeleteProduct(product.id);
                }
              }}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}