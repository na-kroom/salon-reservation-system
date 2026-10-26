"use client";

import { useState } from "react";
import type { Reservation } from "@/types/Reservation";
import { normalizeCustomerName } from "@/utils/customerFormat";

type HomeDashboardProps = {
  todayReservationCount: number;
  completedCount: number;
  todaySales: number;
  monthlySales: number;
  customerCount: number;
  todayReservations: Reservation[];
  reservations: Reservation[];
  onOpenReservations: (date: Date) => void;
};

const toLocalDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function HomeDashboard({
  todayReservationCount,
  completedCount,
  todaySales,
  monthlySales,
  customerCount,
  todayReservations,
  reservations,
  onOpenReservations,
}: HomeDashboardProps) {
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayString = toLocalDateString(new Date());
  const reservationDates = new Set(reservations.map((reservation) => reservation.date));
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const changeMonth = (amount: number) => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + amount, 1));
  };

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-slate-800">ダッシュボード</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">今日の予約</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{todayReservationCount}件</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">会計済み</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completedCount}件</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">今日の売上</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">¥{todaySales.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">今月売上</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">¥{monthlySales.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">登録顧客</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{customerCount}人</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">今日の予約一覧</h3>
          {todayReservations.length === 0 ? (
            <p className="py-5 text-sm text-slate-500">今日の予約はありません。</p>
          ) : (
            <div className="space-y-2">
              {[...todayReservations].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((reservation) => (
                <div key={reservation.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedReservation(selectedReservation?.id === reservation.id ? null : reservation)}
                    className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="w-14 shrink-0 text-sm font-semibold text-slate-800">{reservation.startTime}</span>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${reservation.status === "completed" ? "bg-gray-400" : reservation.status === "cancelled" ? "bg-red-500" : "bg-blue-500"}`} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{normalizeCustomerName(reservation.customer)}</span>
                    <span className="text-xs text-slate-500">{reservation.menu}</span>
                    <span className="text-lg text-slate-300 transition group-hover:text-blue-500">›</span>
                  </button>
                  {selectedReservation?.id === reservation.id && (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="mb-3 text-sm font-semibold text-slate-900">予約詳細</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <p><span className="text-slate-500">お客様：</span>{normalizeCustomerName(reservation.customer)}</p>
                        <p><span className="text-slate-500">メニュー：</span>{reservation.menu}</p>
                        <p><span className="text-slate-500">時間：</span>{reservation.startTime} - {reservation.endTime}</p>
                        <p><span className="text-slate-500">レーン：</span>{reservation.lane}</p>
                        <p><span className="text-slate-500">状態：</span>{reservation.status === "completed" ? "会計済み" : reservation.status === "cancelled" ? "キャンセル" : "予約中"}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-800">予約カレンダー</h3>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="前月" onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">‹</button>
              <span className="min-w-[112px] text-center text-sm font-semibold text-slate-800">{year}年{month + 1}月</span>
              <button type="button" aria-label="翌月" onClick={() => changeMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-slate-500">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="aspect-square" aria-hidden="true" />;
              const dayDate = new Date(year, month, day);
              const dayString = toLocalDateString(dayDate);
              const isToday = dayString === todayString;
              const hasReservation = reservationDates.has(dayString);
              return (
                <button
                  key={dayString}
                  type="button"
                  aria-label={`${year}年${month + 1}月${day}日の予約を表示`}
                  onClick={() => onOpenReservations(dayDate)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition hover:border-blue-400 hover:bg-blue-50 ${isToday ? "border-blue-600 bg-blue-600 font-semibold text-white hover:bg-blue-700" : hasReservation ? "border-blue-200 bg-blue-50 text-blue-900" : "border-transparent text-slate-700 hover:border-slate-200"}`}
                >
                  <span>{day}</span>
                  {hasReservation && <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : "bg-blue-600"}`} />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600" />予約あり</span>
            <button type="button" onClick={() => { const today = new Date(); setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1)); onOpenReservations(today); }} className="font-medium text-blue-700 hover:text-blue-800">今日の予約を見る</button>
          </div>
        </section>
      </div>
    </div>
  );
}
