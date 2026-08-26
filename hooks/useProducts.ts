import { useEffect, useState } from "react";
import type { Product } from "@/types/Product";
import { fetchProducts } from "@/utils/productApi";

export function useProducts() {
  const [products, setProducts] =
    useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "商品データ取得失敗",
          error
        );
      }
    }

    loadProducts();
  }, []);

  return {
    products,
    setProducts,
  };
}