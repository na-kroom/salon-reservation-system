import React from "react";
import type { Product } from "@/types/Product";

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
  const handleAddProduct = () => {
    if (!productName || !productPrice) {
      alert("商品名と価格を入力してください");
      return;
    }

    setProducts([
      ...products,
      {
        id: Date.now(),
        name: productName,
        price: Number(productPrice),
      },
    ]);

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
          商品追加
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
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
}