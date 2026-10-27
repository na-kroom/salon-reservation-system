"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Reservation } from "@/types/Reservation";
import type { Customer } from "@/types/Customer";
import ReservationCalendar from "@/components/ReservationCalendar";

type ReservationPageProps = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;

  setIsModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  times: string[];
  reservations: Reservation[];
  customers: Customer[];
  selectedDate: string;

  setSelectedReservation: React.Dispatch<
    React.SetStateAction<Reservation | null>
  >;

  setIsCustomerModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

export default function ReservationPage({
  date,
  setDate,
  setIsModalOpen,
  times,
  reservations,
  selectedDate,
  setSelectedReservation,
  setIsCustomerModalOpen,
}: ReservationPageProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);
  const getRowSpan = (
    startTime: string,
    endTime: string
  ) => {
    const startHour = Number(startTime.split(":")[0]);
    const startMinute = Number(startTime.split(":")[1]);

    const endHour = Number(endTime.split(":")[0]);
    const endMinute = Number(endTime.split(":")[1]);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    return (end - start) / 30;
  };

  return (
    <>
          {/* 操作エリア */}
          <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* 左側の空きスペース */}
            <div />

            {/* 日付操作：中央揃え */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setDate(new Date())}
                className={`flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                  date.toDateString() === new Date().toDateString()
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                今日
              </button>

              <button
                aria-label="前の日へ"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setDate(date.getDate() - 1);
                  setDate(newDate);
                }}
              >
                ‹
              </button>

              <div className="min-w-[220px] text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-semibold tracking-tight text-slate-900">
                    {date.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>

                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                    {date.toLocaleDateString("ja-JP", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              </div>

              <button
                aria-label="次の日へ"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setDate(date.getDate() + 1);
                  setDate(newDate);
                }}
              >
                ›
              </button>

              <div ref={calendarRef} className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                aria-label="カレンダーを開く"
                title="カレンダー"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" />
                </svg>
              </button>

                {showCalendar && (
                  <div className="absolute right-0 top-14 z-50 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <ReservationCalendar
                      date={date}
                      setDate={setDate}
                      reservations={reservations}
                      onClose={() => setShowCalendar(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 予約追加：右寄せ */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex h-10 items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                ＋ 予約を追加
              </button>
            </div>
          </div>

    
      {/* タイムテーブル */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-none">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1fr)",
        }}
      >

          {/* タイムテーブルヘッダー */}
          <div className="border-b border-slate-200 bg-slate-100 px-3 py-3 text-xs font-semibold tracking-wide text-slate-500">
            時間
          </div>

          <div className="border-b border-l border-slate-200 bg-slate-100 px-3 py-3 text-center text-sm font-semibold tracking-wide text-slate-700">
            Aレーン
          </div>
          <div className="border-b border-l border-slate-200 bg-slate-100 px-3 py-3 text-center text-sm font-semibold tracking-wide text-slate-700">
            Bレーン
          </div>


          {/* 時間ごとの行 */}
          {times.map((time) => (
            <React.Fragment key={time}>

              {/* 時間 */}
              <div className="flex h-12 items-start border-b border-slate-100 bg-slate-50/50 px-3 pt-3 text-xs font-semibold tabular-nums text-slate-600">
                {time}
              </div>

              {/* Aレーン */}
              <div className="relative h-12 border-b border-l border-slate-100 bg-white">
                {reservations
                  .filter(
                    (r) =>
                      r.startTime === time &&
                      r.lane === "A" &&
                      r.date === selectedDate 
                     
                  )
                  .map((r) => (
                    <div
                      key={r.id}
                      className={`absolute left-1 right-1 top-1 z-10 cursor-pointer overflow-hidden rounded-lg border border-l-[3px] px-2.5 py-3 transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        r.status === "completed"
                          ? "border-slate-100 border-l-slate-400 bg-slate-50 hover:bg-slate-100"
                          : r.status === "cancelled"
                          ? "border-slate-200 border-l-rose-300 bg-slate-50 opacity-70"
                          : "border-blue-100 border-l-blue-500 bg-blue-50 hover:bg-blue-100/70"
                      }`}
                      style={{
                        height: `${getRowSpan(
                          r.startTime,
                          r.endTime
                        ) * 48 - 8}px`,
                      }}
                      onClick={() => {
                        setSelectedReservation(r);
                        setIsCustomerModalOpen(true);
                      }}
                    >
                  {r.status === "completed" ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-slate-700">
                          ✓ {r.customer}
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          完了
                        </span>
                      </div>

                      <div className="mt-2 text-sm font-medium text-slate-600">
                        {r.startTime} - {r.endTime}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                      <div
                        className={`min-w-0 truncate text-sm font-semibold ${
                          r.status === "cancelled"
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {r.customer}
                      </div>

                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          r.status === "cancelled"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {r.status === "reserved" && "予約中"}
                          {r.status === "cancelled" && "キャンセル"}
                        </span>
                      </div>

                      <div
                        className={`mt-2 text-sm font-medium ${
                          r.status === "cancelled"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {r.startTime} - {r.endTime}
                      </div>
                      {getRowSpan(r.startTime, r.endTime) > 1 && (
                      <div className="mt-1 truncate text-sm text-slate-700">
                        {r.menu}
                      </div>
                      )}
        
                    </>
                  )}
                    </div>
                  ))}
              </div>

              {/* Bレーン */}
              <div className="relative h-12 border-b border-l border-slate-100 bg-white">
                {reservations
                  .filter(
                    (r) =>
                      r.startTime === time &&
                      r.lane === "B" &&
                      r.date === selectedDate
                  )
                  .map((r) => (
                    <div
                      key={r.id}
                      className={`absolute left-1 right-1 top-1 z-10 cursor-pointer overflow-hidden rounded-lg border border-l-[3px] px-2.5 py-3 transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        r.status === "completed"
                          ? "border-slate-100 border-l-slate-400 bg-slate-50 hover:bg-slate-100"
                          : r.status === "cancelled"
                          ? "border-slate-200 border-l-rose-300 bg-slate-50 opacity-70"
                          : "border-blue-100 border-l-blue-500 bg-blue-50 hover:bg-blue-100/70"
                      }`}
                      style={{
                        height: `${getRowSpan(
                          r.startTime,
                          r.endTime
                        ) * 48 - 8}px`,
                      }}
                      onClick={() => {
                        setSelectedReservation(r);
                        setIsCustomerModalOpen(true);
                      }}
                    >
                  {r.status === "completed" ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-slate-700">
                          ✓ {r.customer}
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          完了
                        </span>
                      </div>

                      <div className="mt-2 text-sm font-medium text-slate-600">
                        {r.startTime} - {r.endTime}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                      <div
                        className={`min-w-0 truncate text-sm font-semibold ${
                          r.status === "cancelled"
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {r.customer}
                      </div>

                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          r.status === "cancelled"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {r.status === "reserved" && "予約中"}
                          {r.status === "cancelled" && "キャンセル"}
                        </span>
                      </div>
                      <div
                        className={`mt-2 text-sm font-medium ${
                          r.status === "cancelled"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {r.startTime} - {r.endTime}
                      </div>

                      {getRowSpan(r.startTime, r.endTime) > 1 && (
                      <div className="mt-1 truncate text-sm text-slate-700">
                        {r.menu}
                      </div>
                      )}
                    </>
                  )}
                    </div>
                  ))}
              </div>

            </React.Fragment>
          ))}
        </div>
        </div>
    </>
  );
}