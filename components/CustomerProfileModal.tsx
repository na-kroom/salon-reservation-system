"use client";

import type { Customer } from "@/types/Customer";
import { useState } from "react";
import type { Reservation } from "@/types/Reservation";

type Props = {
  isOpen: boolean;
  customer: Customer | null;
  reservations: Reservation[];
  onClose: () => void;
  onOpenReservation: (reservation: Reservation) => void;
};

export default function CustomerProfileModal({
  isOpen,
  customer,
  reservations,
  onClose,
  onOpenReservation,
}: Props) {
  const [showPurchases, setShowPurchases] = useState(false);
  const [showVisits, setShowVisits] = useState(false);
  const [purchasePage, setPurchasePage] = useState(1);
  const [visitPage, setVisitPage] = useState(1);
  const PAGE_SIZE = 5;

  if (!isOpen || !customer) return null;

  const customerReservations = reservations
    .filter((item) => item.customerId === customer.id)
    .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
  const completed = customerReservations.filter((item) => item.status === "completed");
  const totalSales = completed.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const lastVisit = completed[0]?.date ?? "-";
  const purchases = customerReservations.filter((item) => Boolean(item.product));
  const totalPurchasePages = Math.max(1, Math.ceil(purchases.length / PAGE_SIZE));
  const totalVisitPages = Math.max(1, Math.ceil(customerReservations.length / PAGE_SIZE));
  const visiblePurchases = purchases.slice((purchasePage - 1) * PAGE_SIZE, purchasePage * PAGE_SIZE);
  const visibleVisits = customerReservations.slice((visitPage - 1) * PAGE_SIZE, visitPage * PAGE_SIZE);

  const renderPagination = (
    page: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => totalPages > 1 ? (
    <div className="flex items-center justify-center gap-3 py-3">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => setPage(Math.max(1, page - 1))}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
      >
        前へ
      </button>
      <span className="text-sm text-slate-500">{page} / {totalPages} ページ</span>
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
      >
        次へ
      </button>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 py-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">顧客カルテ</h2>
          <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-black" aria-label="閉じる">×</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">{customer.name}</h3>
            {customer.kana && <p className="mt-1 text-sm text-slate-500">{customer.kana}</p>}
            <p className="mt-3 text-sm text-slate-700">電話番号：{customer.phone || "未登録"}</p>
            {customer.memo && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">メモ：{customer.memo}</p>}
          </div>

          <h3 className="mb-3 mt-6 text-base font-semibold text-slate-900">顧客情報</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">来店回数</p><p className="mt-1 text-lg font-semibold">{completed.length}回</p></div>
            <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">累計売上</p><p className="mt-1 text-lg font-semibold">¥{totalSales.toLocaleString()}</p></div>
            <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">前回来店</p><p className="mt-1 text-sm font-semibold">{lastVisit}</p></div>
          </div>

          <section className="mt-7">
            <button
              type="button"
              onClick={() => setShowPurchases((value) => !value)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left font-bold text-slate-900 hover:bg-slate-50"
              aria-expanded={showPurchases}
            >
              <span>購入履歴（{purchases.length}件）</span>
              <span>{showPurchases ? "閉じる ▲" : "表示 ▼"}</span>
            </button>
            {showPurchases && (
              <div className="mt-2 rounded-lg border border-slate-200 px-4">
                {purchases.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">購入履歴はありません</p>
                ) : (
                  <>
                    <div className="divide-y divide-slate-200">
                      {visiblePurchases.map((item) => (
                        <div key={`purchase-${item.id}`} className="flex items-center justify-between gap-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.product}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                          </div>
                          <p className="text-sm font-medium text-slate-700">¥{(Number(item.price) || 0).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    {renderPagination(purchasePage, totalPurchasePages, setPurchasePage)}
                  </>
                )}
              </div>
            )}
          </section>

          <section className="mt-4">
            <button
              type="button"
              onClick={() => setShowVisits((value) => !value)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left font-bold text-slate-900 hover:bg-slate-50"
              aria-expanded={showVisits}
            >
              <span>予約・来店履歴（{customerReservations.length}件）</span>
              <span>{showVisits ? "閉じる ▲" : "表示 ▼"}</span>
            </button>
            {showVisits && (
              <div className="mt-2 rounded-lg border border-slate-200 px-4">
                {customerReservations.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">予約・来店履歴はありません</p>
                ) : (
                  <>
                    <div className="divide-y divide-slate-200">
                      {visibleVisits.map((reservation) => (
                        <button
                          key={reservation.id}
                          type="button"
                          onClick={() => onOpenReservation(reservation)}
                          className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-slate-50"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900">{reservation.date}　{reservation.startTime} - {reservation.endTime}</span>
                            <span className="mt-1 block truncate text-sm text-slate-600">{reservation.menu || reservation.memo || "メニュー未登録"}</span>
                          </span>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${reservation.status === "completed" ? "bg-slate-200 text-slate-600" : reservation.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {reservation.status === "completed" ? "会計済み" : reservation.status === "cancelled" ? "キャンセル" : "予約中"}
                          </span>
                        </button>
                      ))}
                    </div>
                    {renderPagination(visitPage, totalVisitPages, setVisitPage)}
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
