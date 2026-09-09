import React, { useState } from "react";
import type { Product } from "@/types/Product";
import type { Customer } from "@/types/Customer";
type Props = {
  isOpen: boolean;
  customer: string;
  customerId: number | null;

  setCustomerId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  customers: Customer[];
  setCustomer: React.Dispatch<
    React.SetStateAction<string>
  >;


  startTime: string;

  setStartTime: React.Dispatch<
    React.SetStateAction<string>
  >;
  times: string[];
  lane: string

  setLane: React.Dispatch<
    React.SetStateAction<string>
  >;
  menu: string;

  setMenu: React.Dispatch<
    React.SetStateAction<string>
  >;
  duration: number;

  setDuration: React.Dispatch<
    React.SetStateAction<number>
  >;
  endTime: string;
  memo: string;

  setMemo: React.Dispatch<
    React.SetStateAction<string>
  >;
  price: string;

  setPrice: React.Dispatch<
    React.SetStateAction<string>
  >;
  onSubmit: () => void;
  products: Product[];

selectedProductId: string;
setSelectedProductId: React.Dispatch<
  React.SetStateAction<string>
>;

product: string;
setProduct: React.Dispatch<
  React.SetStateAction<string>
>;

onClose: () => void;
};

export default function ReservationModal({
  isOpen,
  customer,
  setCustomer,
  startTime,
  setStartTime,
  times,
  lane,
  setLane,
  menu,
  setMenu,

  endTime,
  memo,
  setMemo,
  price,
  setPrice,
  onSubmit,
  products,
  selectedProductId,
  setSelectedProductId,
  product,
  setProduct,
  customers,
  customerId,
  setCustomerId,
  duration,
  setDuration,
  onClose
}: Props) {
  const [customerKeyword, setCustomerKeyword] =
  useState("");
  const [quantity, setQuantity] = useState(1);
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
          <h2 className="text-xl font-bold mb-4">
            予約登録
          </h2>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            顧客
          </label>
          <input
            type="text"
            placeholder="顧客名・フリガナで検索"
            value={customerKeyword}
            onChange={(e) =>
              setCustomerKeyword(e.target.value)
            }
            className="w-full border rounded p-2 mb-2"
          />

          {customerKeyword !== customer && (
            <div className="max-h-40 overflow-y-auto rounded border mb-4">
            {customers
              .filter((customer) => {
                const keyword =
                  customerKeyword.toLowerCase();

                return (
                  customer.name
                    .toLowerCase()
                    .includes(keyword) ||
                  customer.kana
                    .toLowerCase()
                    .includes(keyword)
                );
              })
              .map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    setCustomerId(customer.id);
                    setCustomer(customer.name);
                    setCustomerKeyword(customer.name);
                  }}
                  className={`block w-full border-b p-2 text-left hover:bg-blue-50 ${
                    customerId === customer.id
                      ? "bg-blue-100"
                      : ""
                  }`}
                >
                  <div className="font-medium">
                    {customer.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {customer.kana}
                  </div>
                </button>
              ))}
          </div>
          )}
          <label className="mb-1 block text-sm font-medium text-slate-700">
            開始時間
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            施術時間
          </label>
          <select
            value={duration}
            onChange={(e) =>
              setDuration(Number(e.target.value))
            }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-3"
          >
            {Array.from(
              { length: 24 },
              (_, i) => (i + 1) * 10
            ).map((minutes) => (
              <option
                key={minutes}
                value={minutes}
              >
                {minutes}分
              </option>
            ))}
          </select>
          <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-sm font-medium text-slate-500">
              終了予定
            </span>
            <span className="ml-3 text-sm font-semibold text-slate-800">
              {endTime}
            </span>
          </div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            レーン
          </label>
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
          >
            <option value="A">Aレーン</option>
            <option value="B">Bレーン</option>
          </select>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            メニュー
          </label>
          <select
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
          >
            <option value="カット">カット</option>
            <option value="カラー">カラー</option>
            <option value="カット＋カラー">
              カット＋カラー
            </option>
            <option value="パーマ">パーマ</option>
          </select>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              施術料金
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              disabled={
                selectedProductId !== "" &&
                selectedProductId !== "other"
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
            />
            <label className="mb-1 block text-sm font-medium text-slate-700">
              メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ"
              className="w-full min-h-[110px] resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
            />
          <label className="mb-1 block text-sm font-medium text-slate-700">
            商品
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedProductId(value);

              if (value === "other") {
                setProduct("");
                return;
              }

              const selected =
                products.find(
                  (p) =>
                    p.id.toString() === value
                );

              if (selected) {
                setProduct(selected.name);
                setPrice(
                  String(selected.price)
                );
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-2"
          >
            <option value="">
              商品なし
            </option>

            {products.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.name}
              </option>
            ))}

            <option value="other">
              その他
            </option>
          </select>
          {selectedProductId === "other" && (
            <>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                商品名
              </label>
              <input
                type="text"
                placeholder="商品名"
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-2"
              />
              <label className="mb-1 block text-sm font-medium text-slate-700">
                商品価格
              </label>
              <input
                type="number"
                placeholder="商品価格"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-2"
              />
            </>
          )}
          <label className="mb-1 block text-sm font-medium text-slate-700">
            数量
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-2"
          />
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            閉じる
          </button>

          <button
            onClick={onSubmit}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
          >
            登録
          </button>
        </div>  
        </div>
      </div>
   
  );
}
