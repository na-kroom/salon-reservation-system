"use client";

import React from "react";
import type { Product } from "@/types/Product";
import type { Customer } from "@/types/Customer";

type Props = {
  isOpen: boolean;
  customer: string;
  setCustomer: React.Dispatch<React.SetStateAction<string>>;
  customerId: number | null;
  setCustomerId: React.Dispatch<React.SetStateAction<number | null>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  startTime: string;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  times: string[];
  lane: string;
  setLane: React.Dispatch<React.SetStateAction<string>>;
  menu: string;
  setMenu: React.Dispatch<React.SetStateAction<string>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  endTime: string;
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  price: string;
  setPrice: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: React.Dispatch<React.SetStateAction<string>>;
  product: string;
  setProduct: React.Dispatch<React.SetStateAction<string>>;
  customers: Customer[];
  onClose: () => void;
  onCreateNewCustomer: () => void;
};

export default function ReservationModal({
  isOpen,
  customer,
  setCustomer,
  customerId,
  setCustomerId,
  date,
  setDate,
  startTime,
  setStartTime,
  times,
  lane,
  setLane,
  menu,
  setMenu,
  duration,
  setDuration,
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
  onClose,
  onCreateNewCustomer,
}: Props) {
  if (!isOpen) return null;

  const handleCustomerChange = (value: string) => {
    const selected = customers.find((item) => String(item.id) === value);
    if (!selected) {
      setCustomerId(null);
      setCustomer("");
      return;
    }
    setCustomerId(selected.id);
    setCustomer(selected.name);
  };

  const handleProductChange = (value: string) => {
    setSelectedProductId(value);
    const selected = products.find((item) => String(item.id) === value);
    if (!selected) {
      setProduct("");
      return;
    }
    setProduct(selected.name);
    if ("price" in selected && selected.price !== undefined) {
      setPrice(String(selected.price));
    }
  };

  const dateValue = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">予約登録</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">顧客 *</label>
            <div className="flex gap-2">
              <select
                value={customerId === null ? "" : String(customerId)}
                onChange={(event) => handleCustomerChange(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-3 text-sm"
              >
                <option value="">顧客を選択</option>
                {customers.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}{item.isProvisional ? "（仮登録）" : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onCreateNewCustomer}
                className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                新規顧客
              </button>
            </div>
            {customer && <p className="mt-1 text-xs text-slate-500">選択中：{customer}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">予約日</label>
            <input
              type="date"
              value={dateValue}
              onChange={(event) => {
                if (!event.target.value) return;
                const [year, month, day] = event.target.value.split("-").map(Number);
                setDate(new Date(year, month - 1, day));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">開始時間</label>
              <select
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
              >
                {times.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">所要時間</label>
              <select
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
              >
                {[30, 60, 90, 120, 150, 180, 210, 240].map((value) => (
                  <option key={value} value={value}>{value}分</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">終了予定：{endTime}</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">レーン</label>
            <select
              value={lane}
              onChange={(event) => setLane(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
            >
              {["A", "B", "C", "D"].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">メニュー</label>
            <input
              value={menu}
              onChange={(event) => setMenu(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
              placeholder="例：カット"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">商品（任意）</label>
            <select
              value={selectedProductId}
              onChange={(event) => handleProductChange(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
            >
              <option value="">商品を選択しない</option>
              {products.map((item) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
            {product && <p className="mt-1 text-xs text-slate-500">選択中：{product}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">金額</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">メモ</label>
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-3 text-sm"
              placeholder="予約に関するメモ"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!customerId}
            className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            予約を登録
          </button>
        </div>
      </div>
    </div>
  );
}
