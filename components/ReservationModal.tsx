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
  onClose
}: Props) {
  const [customerKeyword, setCustomerKeyword] =
  useState("");
  const [quantity, setQuantity] = useState(1);
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">
            予約登録
          </h2>
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

          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 w-full mb-3"
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
  
          <select>
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
          <div className="mb-4">
            終了予定: {endTime}
          </div>
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="border p-2 w-full mb-4"
          >
            <option value="A">Aレーン</option>
            <option value="B">Bレーン</option>
          </select>

          <select
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            className="border p-2 w-full mb-4"
          >
            <option value="カット">カット</option>
            <option value="カラー">カラー</option>
            <option value="カット＋カラー">
              カット＋カラー
            </option>
            <option value="パーマ">パーマ</option>
          </select>
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
              className="border p-2 w-full mb-4"
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ"
              className="border p-2 w-full mb-4"
            />
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
            className="border p-2 w-full mb-2"
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
              <input
                type="text"
                placeholder="商品名"
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                className="border p-2 w-full mb-2"
              />

              <input
                type="number"
                placeholder="商品価格"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
            </>
          )}

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={onSubmit}
            className="bg-black text-white px-4 py-2 rounded mr-2"
          >
            登録
          </button>


          <button
            onClick={onClose}
            className="border px-3 py-1 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
   
  );
}
