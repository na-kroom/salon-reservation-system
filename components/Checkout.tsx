import React, { useState } from "react";
import type { Reservation } from "@/types/Reservation";
import type { Product } from "@/types/Product";
import { completeReservation } from "@/utils/reservationApi";

type CheckoutProps = {
  reservations: Reservation[];
  setReservations: React.Dispatch<
    React.SetStateAction<Reservation[]>
  >;
  products: Product[];
};

export default function Checkout({
  reservations,
  setReservations,
  products,
}: CheckoutProps) {
  const [selectedReservationId, setSelectedReservationId] =
    useState<number | null>(null);

  const today = new Date().toLocaleDateString("sv-SE");

  const todayReservations = reservations.filter(
    (r) =>
      r.date === today &&
      r.status === "reserved"
  );
  const selectedReservation =
    todayReservations.find(
      (r) => r.id === selectedReservationId
    ); 
  const subtotal = selectedReservation?.price ?? 0;
  const [selectedProductId, setSelectedProductId] =
    useState<number | null>(null);

  const [checkoutProducts, setCheckoutProducts] =
    useState<
      {
        id: number;
        name: string;
        price: number;
        quantity: number;
      }[]
    >([]);
  const selectedProduct = products.find(
    (p) => p.id === selectedProductId
  );

  const productTotal = checkoutProducts.reduce(
    (sum, product) =>
      sum + product.price * product.quantity,
    0
  );
  const tax = Math.floor(
    (subtotal + productTotal) * 0.1
  );

  const total =
    subtotal +
    productTotal +
    tax;

  const handleCheckout = async () => {
    if (!selectedReservation) {
      alert("予約を選択してください");
      return;
    }

    try {
      const completedReservation =
        await completeReservation(
          selectedReservation.id
        );

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === selectedReservation.id
            ? completedReservation
            : reservation
        )
      );
    } catch (error) {
      console.error(
        "会計処理に失敗しました",
        error
      );
      alert("会計処理に失敗しました。");
      return;
    }

    alert("会計が完了しました。");

    setCheckoutProducts([]);
    setSelectedProductId(null);
    setSelectedReservationId(null);
  };



  return (
  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
      会計
    </h2>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* 左側 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
        会計入力
      </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">予約</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={selectedReservationId ?? ""}
              onChange={(e) =>
                setSelectedReservationId(Number(e.target.value))
              }
            >
              <option value="" disabled>
                予約を選択してください
              </option>

              {todayReservations.map((reservation) => (
                <option
                  key={reservation.id}
                  value={reservation.id}
                >
                  {reservation.startTime}　{reservation.customer}　（{reservation.lane}レーン）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">施術料金</label>
          <input
            type="number"
            value={selectedReservation?.price ?? ""}
            readOnly
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
          />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">商品</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={selectedProductId ?? ""}
              onChange={(e) =>
                setSelectedProductId(Number(e.target.value))
              }
            >
              <option value="" disabled>
                商品を選択してください
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">数量</label>
            <input
              type="number"
              defaultValue={1}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
          onClick={() => {
            if (!selectedProduct) return;

            setCheckoutProducts((prev) => {
              const existing = prev.find(
                (p) => p.id === selectedProduct.id
              );

              if (existing) {
                return prev.map((p) =>
                  p.id === selectedProduct.id
                    ? {
                        ...p,
                        quantity: p.quantity + 1,
                      }
                    : p
                );
              }

              return [
                ...prev,
                {
                  id: selectedProduct.id,
                  name: selectedProduct.name,
                  price: selectedProduct.price,
                  quantity: 1,
                },
              ];
            });

            setSelectedProductId(null);
          }}
          disabled={!selectedProduct}
          className="mt-2 w-full rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            商品を追加
          </button>
        </div>
      </div>

      {/* 右側 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
        会計内容
      </h3>

        <div className="mb-6 space-y-3">
        {checkoutProducts.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
            <p className="text-sm font-medium text-slate-400">
              商品はまだ追加されていません
            </p>
          </div>
        )}
        {checkoutProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
         
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {product.name}
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              ¥{product.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCheckoutProducts((prev) =>
                  prev.flatMap((p) => {
                    if (p.id !== product.id) return [p];

                    if (p.quantity === 1) {
                      return [];
                    }

                    return [
                      {
                        ...p,
                        quantity: p.quantity - 1,
                      },
                    ];
                  })
                )
              }
        
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              −
            </button>

            <span className="w-8 text-center text-sm font-semibold text-slate-700">
              {product.quantity}
            </span>

            <button
              onClick={() =>
                setCheckoutProducts((prev) =>
                  prev.map((p) =>
                    p.id === product.id
                      ? {
                          ...p,
                          quantity: p.quantity + 1,
                        }
                      : p
                  )
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              ＋
            </button>

          <button
            onClick={() =>
              setCheckoutProducts((prev) =>
                prev.filter((p) => p.id !== product.id)
              )
            }
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            削除
          </button>
          </div>
        </div>
        ))}
        </div>

        <hr className="my-5 border-slate-100" />
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-sm text-slate-600">
            <span>施術料金</span>
            <span className="font-medium text-slate-700">¥{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between px-1 text-sm text-slate-600">
            <span>商品合計</span>
            <span className="font-medium text-slate-700">¥{productTotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between px-1 text-sm text-slate-600">
            <span>消費税</span>
            <span className="font-medium text-slate-700">¥{tax.toLocaleString()}</span>
          </div>
        </div>   
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-4">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold text-slate-600">
              お会計合計
            </span>

            <span className="text-2xl font-bold tracking-tight text-slate-900">
              ¥{total.toLocaleString()}
            </span>
          </div>
        </div>
        
      <button
        onClick={handleCheckout}
        disabled={!selectedReservation}
        className="mt-5 w-full rounded-xl bg-blue-700 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        会計完了
      </button>
  
      </div>
    </div>
  </div>
)}