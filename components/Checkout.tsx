"use client";

import React, { useState } from "react";
import type { Reservation } from "@/types/Reservation";
import type { Product, ProductCategory } from "@/types/Product";
import { completeReservation, updateReservation } from "@/utils/reservationApi";
import { normalizeCustomerName } from "@/utils/customerFormat";

type CheckoutProps = {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  products: Product[];
};

type CheckoutProduct = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const categories: (ProductCategory | "すべて")[] = [
  "すべて",
  "スキンケア",
  "ヘアケア",
  "美容雑貨",
  "その他",
];

export default function Checkout({
  reservations,
  setReservations,
  products,
}: CheckoutProps) {
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [checkoutPage, setCheckoutPage] = useState<"input" | "products">("input");
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory | "すべて">("すべて");
  const [checkoutProducts, setCheckoutProducts] = useState<CheckoutProduct[]>([]);
  const [pendingQuantities, setPendingQuantities] = useState<Record<number, number>>({});

  const today = new Date().toLocaleDateString("sv-SE");
  const todayReservations = reservations.filter(
    (reservation) => reservation.date === today && reservation.status === "reserved"
  );
  const selectedReservation = todayReservations.find(
    (reservation) => reservation.id === selectedReservationId
  );

  const subtotal = Number(editingPrice) || 0;
  const productTotal = checkoutProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const tax = Math.floor((subtotal + productTotal) * 0.1);
  const total = subtotal + productTotal + tax;

  const changePendingQuantity = (productId: number, change: number) => {
    setPendingQuantities((previous) => {
      const nextQuantity = Math.max(0, (previous[productId] ?? 0) + change);
      const next = { ...previous };
      if (nextQuantity === 0) {
        delete next[productId];
      } else {
        next[productId] = nextQuantity;
      }
      return next;
    });
  };

  const addSelectedProducts = () => {
    if (!selectedReservation) {
      alert("予約・顧客を選択してください。");
      setCheckoutPage("input");
      return;
    }

    const selectedProducts = products.filter(
      (product) => (pendingQuantities[product.id] ?? 0) > 0
    );
    if (selectedProducts.length === 0) return;

    setCheckoutProducts((previous) => {
      const next = [...previous];
      selectedProducts.forEach((product) => {
        const quantity = pendingQuantities[product.id] ?? 0;
        const existingIndex = next.findIndex((item) => item.id === product.id);
        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity,
          };
        } else {
          next.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
          });
        }
      });
      return next;
    });

    setPendingQuantities({});
    setCheckoutCompleted(false);
    setCheckoutPage("input");
  };

  const handleCheckout = async () => {
    if (!selectedReservation) {
      alert("予約を選択してください");
      return;
    }

    try {
      const updatedReservation = await updateReservation(selectedReservation.id, {
        ...selectedReservation,
        price: Number(editingPrice) || 0,
      });
      const completedReservation = await completeReservation(updatedReservation.id);
      setReservations((previous) =>
        previous.map((reservation) =>
          reservation.id === selectedReservation.id ? completedReservation : reservation
        )
      );
    } catch (error) {
      console.error("会計処理に失敗しました", error);
      alert("会計処理に失敗しました。");
      return;
    }

    alert("会計が完了しました。");
    setCheckoutCompleted(true);
    setEditingPrice("");
    setCheckoutProducts([]);
    setSelectedReservationId(null);
    setCheckoutPage("input");
  };

  const tabClass = (active: boolean) =>
    `rounded-t-xl border px-5 py-3 text-sm font-semibold transition ${
      active
        ? "border-slate-200 border-b-white bg-white text-slate-900"
        : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="mx-auto max-w-5xl">
      {checkoutCompleted && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-semibold text-green-700">会計が完了しました。</p>
        </div>
      )}

      <div className="flex items-end gap-2 border-b border-slate-200">
        <button type="button" onClick={() => setCheckoutPage("input")} className={tabClass(checkoutPage === "input")}>
          会計入力
        </button>
        <button type="button" onClick={() => setCheckoutPage("products")} className={tabClass(checkoutPage === "products")}>
          商品を追加
        </button>
      </div>

      {checkoutPage === "input" ? (
        <div className="grid gap-6 rounded-b-2xl rounded-tr-2xl border border-slate-200 border-t-0 bg-slate-50/50 p-4 sm:p-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">会計入力</h3>

            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="checkout-reservation" className="mb-2 block text-sm font-medium text-slate-700">予約・顧客</label>
                <select
                  id="checkout-reservation"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  value={selectedReservationId ?? ""}
                  onChange={(event) => {
                    const id = Number(event.target.value);
                    setSelectedReservationId(id);
                    const reservation = todayReservations.find((item) => item.id === id);
                    setEditingPrice(reservation ? String(reservation.price) : "");
                    setCheckoutCompleted(false);
                  }}
                >
                  <option value="">
                    {todayReservations.length === 0
                      ? "本日の会計可能な予約はありません"
                      : "予約・顧客を選択してください"}
                  </option>
                  {todayReservations.map((reservation) => (
                    <option key={reservation.id} value={reservation.id}>
                      {reservation.startTime}　{normalizeCustomerName(reservation.customer)}（{reservation.lane}レーン）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="checkout-service-price" className="mb-2 block text-sm font-medium text-slate-700">施術料金</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">¥</span>
                  <input
                    id="checkout-service-price"
                    type="number"
                    min="0"
                    value={editingPrice}
                    onChange={(event) => setEditingPrice(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">商品</label>
                  <span className="text-xs text-slate-400">{checkoutProducts.reduce((sum, item) => sum + item.quantity, 0)}点</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutPage("products")}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <span className={`text-sm font-medium ${selectedReservation ? "text-slate-700" : "text-slate-400"}`}>
                    {selectedReservation ? "商品を選択" : "予約・顧客を選択してください"}
                  </span>
                  <span className="text-lg text-slate-400">＋</span>
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">会計内容</h3>
              <span className="text-xs font-medium text-slate-400">税込計算</span>
            </div>

            <div className="mt-5 space-y-3">
              {checkoutProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-500">商品はまだ追加されていません</p>
                  <p className="mt-1 text-xs text-slate-400">「商品を選択」から追加できます。</p>
                </div>
              ) : (
                checkoutProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">¥{product.price.toLocaleString()} × {product.quantity}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">¥{(product.price * product.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button type="button" aria-label={`${product.name}の数量を減らす`} onClick={() => setCheckoutProducts((previous) => previous.flatMap((item) => item.id !== product.id ? [item] : item.quantity <= 1 ? [] : [{ ...item, quantity: item.quantity - 1 }]))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100">−</button>
                      <span className="w-5 text-center text-sm font-semibold text-slate-700">{product.quantity}</span>
                      <button type="button" aria-label={`${product.name}の数量を増やす`} onClick={() => setCheckoutProducts((previous) => previous.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100">＋</button>
                      <button type="button" onClick={() => setCheckoutProducts((previous) => previous.filter((item) => item.id !== product.id))} className="rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50">削除</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center justify-between text-slate-600"><span>施術料金</span><span>¥{subtotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between text-slate-600"><span>商品合計</span><span>¥{productTotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between text-slate-600"><span>消費税（10%）</span><span>¥{tax.toLocaleString()}</span></div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-900 px-4 py-4 text-white">
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm font-medium text-slate-300">お会計合計</span>
                <span className="text-2xl font-bold tracking-tight">¥{total.toLocaleString()}</span>
              </div>
            </div>

            <button type="button" onClick={handleCheckout} disabled={!selectedReservation} className="mt-5 w-full rounded-xl bg-slate-800 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
              会計完了
            </button>
          </section>
        </div>
      ) : (
        <section className="flex h-[calc(100dvh-180px)] min-h-[420px] flex-col overflow-hidden rounded-b-2xl rounded-tr-2xl border border-slate-200 border-t-0 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">商品を追加</h3>
  
            </div>
            <button type="button" onClick={() => setCheckoutPage("input")} className="self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:self-auto">← 会計入力に戻る</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="商品カテゴリ">
            {categories.map((category) => (
              <button key={category} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeCategory === category ? "bg-slate-800 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {category}
              </button>
            ))}
          </div>

          {products.filter((product) => activeCategory === "すべて" || (product.category ?? "その他") === activeCategory).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm text-slate-500">このカテゴリの商品はありません</p>
            </div>
          ) : (
            <div className="mt-4 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {products
                .filter((product) => activeCategory === "すべて" || (product.category ?? "その他") === activeCategory)
                .map((product) => {
                  const quantity = pendingQuantities[product.id] ?? 0;
                  return (
                    <article key={product.id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-slate-800">{product.name}</h4>
                        <p className="mt-1 text-sm text-slate-500">¥{product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label={`${product.name}の数量を減らす`}
                          onClick={() => changePendingQuantity(product.id, -1)}
                          disabled={quantity === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >−</button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums text-slate-800">{quantity}</span>
                        <button
                          type="button"
                          aria-label={`${product.name}の数量を増やす`}
                          onClick={() => changePendingQuantity(product.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        >＋</button>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}

          <div className="mt-4 shrink-0 border-t border-slate-200 bg-white pt-3">
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">選択商品</h4>
                <span className="text-xs text-slate-500">
                  {Object.values(pendingQuantities).reduce((sum, quantity) => sum + quantity, 0)}点
                </span>
              </div>
              {products.some((product) => (pendingQuantities[product.id] ?? 0) > 0) ? (
                <div className="max-h-24 space-y-2 overflow-y-auto">
                  {products.filter((product) => (pendingQuantities[product.id] ?? 0) > 0).map((product) => {
                    const quantity = pendingQuantities[product.id] ?? 0;
                    return (
                      <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 flex-1 truncate text-slate-600">
                          {product.name} <span className="text-xs text-slate-400">¥{product.price.toLocaleString()} × {quantity}</span>
                        </span>
                        <span className="shrink-0 font-medium tabular-nums text-slate-800">¥{(product.price * quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-1 text-sm text-slate-400">商品を選択してください</p>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-300 pt-2">
                <span className="text-sm font-semibold text-slate-700">商品合計</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  ¥{products.reduce((sum, product) => sum + product.price * (pendingQuantities[product.id] ?? 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 pb-1">
              <div>
                <p className="text-xs text-slate-500">選択中の商品</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {Object.values(pendingQuantities).reduce((sum, quantity) => sum + quantity, 0)}点
                </p>
              </div>
              <button
                type="button"
                onClick={addSelectedProducts}
                disabled={Object.values(pendingQuantities).every((quantity) => quantity === 0)}
                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                選択した商品を追加
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
