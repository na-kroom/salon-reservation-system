"use client";

import { useRef, useState } from "react";
import type { Customer } from "@/types/Customer";
import type { Reservation } from "@/types/Reservation";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/utils/customerApi";
import {
  normalizeCustomerName,
  normalizePhoneNumber,
} from "@/utils/customerFormat";
const kanaGroups: Record<string, string[]> = {
  あ: ["ア", "イ", "ウ", "エ", "オ"],
  か: ["カ", "キ", "ク", "ケ", "コ", "ガ", "ギ", "グ", "ゲ", "ゴ"],
  さ: ["サ", "シ", "ス", "セ", "ソ", "ザ", "ジ", "ズ", "ゼ", "ゾ"],
  た: ["タ", "チ", "ツ", "テ", "ト", "ダ", "ヂ", "ヅ", "デ", "ド"],
  な: ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  は: [
    "ハ", "ヒ", "フ", "ヘ", "ホ",
    "バ", "ビ", "ブ", "ベ", "ボ",
    "パ", "ピ", "プ", "ペ", "ポ",
  ],
  ま: ["マ", "ミ", "ム", "メ", "モ"],
  や: ["ヤ", "ユ", "ヨ"],
  ら: ["ラ", "リ", "ル", "レ", "ロ"],
  わ: ["ワ", "ヲ", "ン"],
};

const getKanaGroup = (kana: string): string => {
  const normalized = normalizeCustomerName(kana)
    .replace(/[\u30A1-\u30F6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    )
    .replace(/[\s　]/g, "");

  const firstChar = normalized.charAt(0);

  for (const [group, chars] of Object.entries(kanaGroups)) {
    const normalizedChars = chars.map((char) =>
      char.replace(/[\u30A1-\u30F6]/g, (c) =>
        String.fromCharCode(c.charCodeAt(0) - 0x60)
      )
    );

    if (normalizedChars.includes(firstChar)) {
      return group;
    }
  }

  return "他";
};
type CustomerManagementProps = {
  customers: Customer[];
  reservations: Reservation[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onReserve: (customer: Customer) => void;
};

export default function CustomerManagement({
  customers,
  reservations,
  setCustomers,
  onReserve,
}: CustomerManagementProps) {
  const customerFormRef = useRef<HTMLDivElement>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerKana, setCustomerKana] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMemo, setCustomerMemo] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "register">("list");
  const [selectedKanaGroup, setSelectedKanaGroup] = useState("すべて");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

  const resetForm = () => {
    setEditingCustomerId(null);
    setCustomerName("");
    setCustomerKana("");
    setCustomerPhone("");
    setCustomerMemo("");
  };

  const getCustomerVisitCount = (customerId: number) =>
    reservations.filter(
      (reservation) =>
        reservation.customerId === customerId &&
        reservation.status === "completed"
    ).length;

  const filteredCustomers = customers
    .filter((customer) => {
      const keyword = normalizeCustomerName(customerSearch).toLowerCase();
      const name = normalizeCustomerName(customer.name).toLowerCase();
      const kana = normalizeCustomerName(customer.kana).toLowerCase();
      const phone = normalizePhoneNumber(customer.phone);
      const phoneKeyword = normalizePhoneNumber(customerSearch).trim();

      const matchesSearch =
        keyword === "" ||
        name.includes(keyword) ||
        kana.includes(keyword) ||
        phone.includes(phoneKeyword);

      const matchesKanaGroup =
        selectedKanaGroup === "すべて" ||
        getKanaGroup(customer.kana) === selectedKanaGroup;

      return matchesSearch && matchesKanaGroup;
    })
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"));

  const handleAddCustomer = async () => {
    const normalizedName = normalizeCustomerName(customerName);
    const normalizedKana = normalizeCustomerName(customerKana);
    const normalizedPhone = normalizePhoneNumber(customerPhone).trim();

    if (!normalizedName || !normalizedKana || !normalizedPhone) {
      alert("顧客名・フリガナ・電話番号を入力してください。");
      return;
    }

    if (editingCustomerId !== null) {
      try {
        const updatedCustomer = await updateCustomer(editingCustomerId, {
          name: normalizedName,
          kana: normalizedKana,
          phone: normalizedPhone,
          memo: customerMemo.trim(),
        });

        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editingCustomerId ? updatedCustomer : customer
          )
        );
        resetForm();
        setActiveTab("list");
      } catch (error) {
        console.error("顧客編集に失敗しました", error);
        alert("顧客編集に失敗しました。");
      }
      return;
    }

    try {
      const newCustomer = await createCustomer({
        name: normalizedName,
        kana: normalizedKana,
        phone: normalizedPhone,
        memo: customerMemo.trim(),
      });

      setCustomers((prev) => [...prev, newCustomer]);
      resetForm();
      setCustomerSearch("");
      setSelectedKanaGroup("すべて");
      setActiveTab("list");
    } catch (error) {
      console.error("顧客登録に失敗しました", error);
      alert("顧客登録に失敗しました。");
    }
  };

  const startEditingCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerKana(customer.kana);
    setCustomerPhone(customer.phone);
    setCustomerMemo(customer.memo ?? "");
    setActiveTab("register");
    requestAnimationFrame(() => {
      customerFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    const hasReservation = reservations.some(
      (reservation) => reservation.customerId === customer.id
    );

    if (hasReservation) {
      alert("予約履歴があるため削除できません。");
      return;
    }

    if (!confirm(`${normalizeCustomerName(customer.name)}さんを削除しますか？`)) {
      return;
    }

    try {
      await deleteCustomer(customer.id);
      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
      if (editingCustomerId === customer.id) resetForm();
    } catch (error) {
      console.error("顧客削除に失敗しました", error);
      alert("顧客削除に失敗しました。");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* タブ切り替え。ページ上部のメインナビゲーションには影響しない */}
      <div className="flex items-end gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`rounded-t-xl border px-6 py-3 text-sm font-semibold transition ${
            activeTab === "list"
              ? "border-slate-300 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          顧客一覧
        </button>
        <button
          type="button"
          onClick={() => {
            if (editingCustomerId === null) resetForm();
            setActiveTab("register");
          }}
          className={`rounded-t-xl border px-6 py-3 text-sm font-semibold transition ${
            activeTab === "register"
              ? "border-slate-300 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          ＋ 顧客登録
        </button>
      </div>

      {activeTab === "register" && (
        <div ref={customerFormRef} className="mt-6 space-y-3">
          {editingCustomerId !== null && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="font-semibold text-slate-900">顧客情報を編集中</p>
              <p className="mt-1 text-sm text-slate-600">
                {normalizeCustomerName(customerName)} さんの情報を変更しています。
              </p>
            </div>
          )}
          <input
            type="text"
            placeholder="顧客名"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="text"
            placeholder="フリガナ"
            value={customerKana}
            onChange={(event) => setCustomerKana(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="text"
            placeholder="電話番号"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <textarea
            placeholder="メモ"
            value={customerMemo}
            onChange={(event) => setCustomerMemo(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddCustomer}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              {editingCustomerId === null ? "顧客登録" : "変更を保存"}
            </button>
            {editingCustomerId !== null && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("list");
                }}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                編集をキャンセル
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              顧客名・フリガナ・電話番号から検索できます
            </p>
            <span className="shrink-0 text-sm text-slate-500">
              全 {filteredCustomers.length} 件
            </span>
          </div>
          <input
            type="text"
            placeholder="顧客名・フリガナ・電話番号で検索"
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (showCustomerList) {
                  setShowCustomerList(false);
                } else {
                  setSelectedKanaGroup("すべて");
                  setShowCustomerList(true);
                }
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                showCustomerList
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {showCustomerList ? "一覧を閉じる" : "一覧"}
            </button>
            {[...Object.keys(kanaGroups), "他"].map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => {
                  setSelectedKanaGroup(group);
                  setShowCustomerList(true);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedKanaGroup === group
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {showCustomerList && <div className="mt-6 space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900">
                      {normalizeCustomerName(customer.name)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {normalizeCustomerName(customer.kana)}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      📞 {normalizePhoneNumber(customer.phone)}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      来店回数：{getCustomerVisitCount(customer.id)}回
                    </div>
                    {customer.memo && (
                      <div className="mt-2 text-sm text-slate-600">
                        メモ：{customer.memo}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => onReserve(customer)}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                      この顧客で予約
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditingCustomer(customer)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomer(customer)}
                      className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                該当する顧客が見つかりません
              </p>
            )}
          </div>
          }
        </div>
      )}
    </div>
  );
}
