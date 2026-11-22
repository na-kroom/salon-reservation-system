"use client";

import { useEffect, useRef, useState } from "react";
import type { Customer } from "@/types/Customer";
import type { Reservation } from "@/types/Reservation";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  anonymizeCustomer,
} from "@/utils/customerApi";
import {
  normalizeCustomerName,
  normalizePhoneNumber,
} from "@/utils/customerFormat";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("ja")
    .replace(/[\u30A1-\u30F6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    )
    .replace(/[\s　]/g, "");

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
  onOpenCustomerSettings: () => void;
};

export default function CustomerManagement({
  customers,
  reservations,
  setCustomers,
  onReserve,
  onOpenCustomerSettings,
}: CustomerManagementProps) {
  const customerFormRef = useRef<HTMLDivElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerKana, setCustomerKana] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMemo, setCustomerMemo] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [activeTab, setActiveTab] = useState<
    "formal" | "provisional" | "register"
  >("formal");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedKanaGroup, setSelectedKanaGroup] = useState("すべて");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(
    null
  );

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

  // 仮登録顧客の件数はタブの通知バッジに表示する。
  const provisionalCount = customers.filter(
    (customer) => customer.isProvisional
  ).length;

  const filteredCustomers = customers
    .filter((customer) => { 

      if (customer.isArchived) {
        return false;
      }

      if (activeTab === "provisional") {
        return customer.isProvisional;
      }

      if (activeTab === "formal") {
        return !customer.isProvisional;
      }

      return true;
    })
    .filter((customer) => {
      const keyword = normalizeSearchText(customerSearch);
      const name = normalizeSearchText(customer.name);
      const kana = normalizeSearchText(customer.kana);
      const phone = normalizePhoneNumber(customer.phone);
      const phoneKeyword = normalizePhoneNumber(customerSearch).trim();

      const matchesSearch =
        keyword === "" ||
        name.includes(keyword) ||
        kana.includes(keyword) ||
        (phoneKeyword !== "" && phone.includes(phoneKeyword));

      const matchesKanaGroup =
        selectedKanaGroup === "すべて" ||
        getKanaGroup(customer.kana) === selectedKanaGroup;

      return matchesSearch && matchesKanaGroup;
    })
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"));

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 一覧表示の条件を先に判定し、JSX内でactiveTabの型が不必要に絞り込まれないようにする。
  const isCustomerListTab =
    activeTab === "formal" || activeTab === "provisional";
  const shouldShowCustomerList =
    activeTab === "provisional" ||
    (activeTab === "formal" && showCustomerList);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleAddCustomer = async () => {
    const normalizedName = normalizeCustomerName(customerName);
    const normalizedKana = normalizeCustomerName(customerKana);
    const normalizedPhone = normalizePhoneNumber(customerPhone).trim();

    if (!normalizedName || !normalizedKana || !normalizedPhone) {
      alert("顧客名・フリガナ・電話番号を入力してください。");
      return;
    }
    if (editingCustomerId !== null) {
      const existing = customers.find(
        (item) => item.id === editingCustomerId
      );

      if (existing?.name === "削除済み顧客") {
        alert("匿名化済みの顧客は編集できません。");
        resetForm();
        return;
      }
    }
    if (editingCustomerId !== null) {
      try {
        const existing = customers.find((item) => item.id === editingCustomerId);
        const updatedCustomer = await updateCustomer(editingCustomerId, {
          name: normalizedName,
          kana: normalizedKana,
          phone: normalizedPhone,
          memo: customerMemo.trim(),
          isProvisional: existing?.isProvisional ?? false,
        });

        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editingCustomerId ? updatedCustomer : customer
          )
        );

        resetForm();
        setActiveTab(existing?.isProvisional ? "provisional" : "formal");
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
        isProvisional: false,
      });

      setCustomers((prev) => [...prev, newCustomer]);

      resetForm();
      setCustomerSearch("");
      setSelectedKanaGroup("すべて");
      setActiveTab("formal");
    } catch (error) {
      console.error("顧客登録に失敗しました", error);
      alert("顧客登録に失敗しました。");
    }
  };

  const startEditingCustomer = (customer: Customer) => {
    if (customer.name === "削除済み顧客") {
      alert("匿名化済みの顧客は編集できません。");
      return;
    }
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

  // 顧客を非表示
  const handleArchiveCustomer = async (customer: Customer) => {
    const today = new Date().toLocaleDateString("sv-SE");

    const hasFutureReservation = reservations.some(
      (reservation) =>
        reservation.customerId === customer.id &&
        reservation.status === "reserved" &&
        reservation.date >= today
    );

    if (hasFutureReservation) {
      alert("未来の予約があるため非表示にできません。予約を確認してください。");
      return;
    }

    if (!confirm(`${customer.name}さんを非表示しますか？`)) {
      return;
    }

    try {
      const updated = await updateCustomer(customer.id, {
        name: customer.name,
        kana: customer.kana,
        phone: customer.phone,
        memo: customer.memo,
        isArchived: true,
        archivedAt: new Date().toISOString(),
      });

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id ? updated : item
        )
      );
      } catch (error) {
        console.error("顧客の非表示に失敗しました:", error);

        const err = error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

        alert(
          [
            "非表示に失敗しました。",
            `エラー: ${err.message ?? "不明"}`,
            `詳細: ${err.details ?? "なし"}`,
            `コード: ${err.code ?? "なし"}`,
            `ヒント: ${err.hint ?? "なし"}`,
          ].join("\n")
        );
      }
  };

    // 顧客情報を匿名化
  const handleAnonymizeCustomer = async (customer: Customer) => {
    if (customer.name === "削除済み顧客") {
      alert("この顧客はすでに匿名化されています。");
      return;
    }

    const confirmed = confirm(
      `${customer.name}さんの個人情報を匿名化します。\n\n` +
      "・顧客名を「削除済み顧客」に変更\n" +
      "・フリガナ、電話番号、顧客メモを削除\n" +
      "・予約履歴の顧客名も変更\n\n" +
      "予約・売上履歴は保持されます。\n" +
      "この操作は元に戻せません。実行しますか？"
    );

    if (!confirmed) return;

    try {
      await anonymizeCustomer(customer.id);

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id
            ? {
                ...item,
                name: "削除済み顧客",
                kana: "",
                phone: "",
                memo: "",
              }
            : item
        )
      );

      alert("顧客情報を匿名化しました。");
    } catch (error) {
      console.error("顧客情報の匿名化に失敗しました:", error);

      if (error instanceof Error) {
        alert(`匿名化に失敗しました。\n${error.message}`);
      } else {
        alert("顧客情報の匿名化に失敗しました。");
      }
    }
  };
  const handleDeleteCustomer = async (customer: Customer) => {
    const hasReservation = reservations.some(
      (reservation) => reservation.customerId === customer.id
    );

    if (hasReservation) {
      alert("予約履歴があるため削除できません。");
      return;
    }

    if (
      !confirm(`${normalizeCustomerName(customer.name)}さんを削除しますか？`)
    ) {
      return;
    }

    try {
      await deleteCustomer(customer.id);

      setCustomers((prev) =>
        prev.filter((item) => item.id !== customer.id)
      );

      if (editingCustomerId === customer.id) {
        resetForm();
      }
    } catch (error) {
      console.error("顧客削除に失敗しました", error);
      alert("顧客削除に失敗しました。");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">顧客管理</h2>
        <button
          type="button"
          onClick={onOpenCustomerSettings}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          顧客設定
        </button>
      </div>

      {/* タブ：商品管理画面と同じく、カードの外側に配置 */}
      <div className="flex items-end gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => { setActiveTab("formal"); setCurrentPage(1); }}
          className={`rounded-t-xl border px-5 py-3 text-sm font-semibold transition ${
            activeTab === "formal"
              ? "border-slate-300 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          正式顧客
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("provisional");
            setCurrentPage(1);
            setSelectedKanaGroup("すべて");
            setShowCustomerList(true);
          }}
          className={`rounded-t-xl border px-5 py-3 text-sm font-semibold transition ${activeTab === "provisional" ? "border-slate-300 border-b-white bg-white text-slate-900" : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
        >
          <span className="inline-flex items-center gap-2">
            仮登録顧客
            {provisionalCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {provisionalCount}
              </span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (editingCustomerId === null) {
              resetForm();
            }
            setActiveTab("register");
          }}
          className={`rounded-t-xl border px-5 py-3 text-sm font-semibold transition ${
            activeTab === "register"
              ? "border-slate-300 border-b-white bg-white text-slate-900"
              : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          ＋ 顧客登録
        </button>
      </div>

      {/* タブの下側だけを白いカードで囲む */}
      <div className="min-h-[300px] rounded-b-2xl rounded-tr-2xl border border-slate-200 border-t-0 bg-white p-6 shadow-sm">
        {activeTab === "register" && (
          <div ref={customerFormRef} className="space-y-3">
            {editingCustomerId !== null && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="font-semibold text-slate-900">
                  顧客情報を編集中
                </p>
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
                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
              >
                {editingCustomerId === null ? "顧客登録" : "変更を保存"}
              </button>

              {editingCustomerId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("formal");
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  編集をキャンセル
                </button>
              )}
            </div>
          </div>
        )}

        {isCustomerListTab && (
          <div>
            <div className="mb-3 flex justify-end">
              <span className="shrink-0 text-sm text-slate-500">
                全 {filteredCustomers.length} 件
              </span>
            </div>

            <input
              type="text"
              placeholder="顧客名・フリガナ・電話番号で検索"
              value={customerSearch}
              onChange={(event) => { setCustomerSearch(event.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            {activeTab === "formal" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (showCustomerList) {
                      setShowCustomerList(false);
                    } else {
                      setSelectedKanaGroup("すべて");
                      setCurrentPage(1);
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
                      setCurrentPage(1);
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
            )}

            {shouldShowCustomerList && (
              <div className="mt-6 space-y-3">
                {paginatedCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-slate-900">
                          {normalizeCustomerName(customer.name)}
                          {customer.isProvisional && <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">仮登録</span>}
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

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {customer.name === "削除済み顧客" ? (
                          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">
                            個人情報は匿名化済みです
                          </span>
                        ) : (
                          <>
                        <button
                          type="button"
                          onClick={() => onReserve(customer)}
                          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                          この顧客で予約
                        </button>

                        {customer.isProvisional && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`${customer.name}さんを正式顧客に変更しますか？`)) return;

                              try {
                                const updated = await updateCustomer(customer.id, {
                                  name: customer.name,
                                  kana: customer.kana,
                                  phone: customer.phone,
                                  memo: customer.memo,
                                  isProvisional: false,
                                });

                                setCustomers((prev) =>
                                  prev.map((item) =>
                                    item.id === customer.id ? updated : item
                                  )
                                );
                              } catch (error) {
                                console.error("正式顧客への変更に失敗しました", error);
                                alert("変更に失敗しました。");
                              }
                            }}
                            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            正式登録にする
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => startEditingCustomer(customer)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          編集
                        </button>

                        <button
                          type="button"
                          onClick={() => handleArchiveCustomer(customer)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                        >
                          非表示
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAnonymizeCustomer(customer)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                        >
                          個人情報を匿名化
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(customer)}
                          className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600"
                        >
                          削除
                        </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCustomers.length === 0 && (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    該当する顧客が見つかりません
                  </p>
                )}
                {filteredCustomers.length > PAGE_SIZE && (
                  <div className="flex items-center justify-center gap-4 pt-3">
                    <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">前へ</button>
                    <span className="text-sm text-slate-600">{currentPage} / {totalPages} ページ</span>
                    <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">次へ</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}