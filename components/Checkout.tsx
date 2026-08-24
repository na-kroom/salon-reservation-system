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

  const today = new Date().toISOString().split("T")[0];

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
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="mb-6 text-3xl font-bold text-gray-800">
      会計
    </h2>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* 左側 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">会計入力</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">予約</label>
            <select
              className="w-full rounded-lg border p-2"
              value={selectedReservationId ?? ""}
              onChange={(e) =>
                setSelectedReservationId(Number(e.target.value))
              }
            >
              <option value="">
                予約を選択してください
              </option>

              {todayReservations.map((reservation) => (
                <option
                  key={reservation.id}
                  value={reservation.id}
                >
                  {reservation.startTime}
                  {" "}
                  {reservation.customer}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">施術料金</label>
            <input
              type="number"
              value={selectedReservation?.price ?? ""}
              readOnly
              className="w-full rounded-lg border p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">商品</label>
            <select
              className="w-full rounded-lg border p-2"
              value={selectedProductId ?? ""}
              onChange={(e) =>
                setSelectedProductId(Number(e.target.value))
              }
            >
              <option value="">商品を選択</option>

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
            <label className="mb-1 block text-sm font-medium">数量</label>
            <input
              type="number"
              defaultValue={1}
              className="w-full rounded-lg border p-2"
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
          className="w-full rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700 disabled:bg-gray-400"
          >
            商品を追加
          </button>
        </div>
      </div>

      {/* 右側 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">会計内容</h3>

        <div className="mb-6 space-y-2">
        {checkoutProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between py-2"
        >
          <div>
            <div>{product.name}</div>

            <div className="text-sm text-gray-500">
              ¥{product.price.toLocaleString()}
            </div>
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
              className="h-8 w-8 rounded bg-gray-200"
            >
              −
            </button>

            <span className="w-6 text-center">
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
              className="h-8 w-8 rounded bg-gray-200"
            >
              ＋
            </button>

            <button
              onClick={() =>
                setCheckoutProducts((prev) =>
                  prev.filter((p) => p.id !== product.id)
                )
              }
              className="rounded bg-red-500 px-2 py-1 text-white"
            >
              削除
            </button>
          </div>
        </div>
        ))}
        </div>

        <hr className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between">
          <span>施術料金</span>
          <span>¥{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
          <span>商品合計</span>
          <span>
            ¥{productTotal.toLocaleString()}
          </span>
          </div>

          <div className="flex justify-between">
            <span>消費税</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>

          <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">
            <span>合計</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>

      <button
        onClick={handleCheckout}
        disabled={!selectedReservation}
        className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        会計完了
      </button>
      </div>
    </div>
  </div>
)}