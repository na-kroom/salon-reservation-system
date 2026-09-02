"use client";

import React, { useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");

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
      {/* 予約管理ヘッダー */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          予約管理
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          予約状況を確認・管理できます
        </p>
      </div>

      {/* 操作エリア */}
      <div className="mb-5 flex items-center justify-between gap-4">

        {/* 予約追加 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="
            rounded-xl
            bg-blue-700
            px-5 py-3
            text-sm font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-800
            focus:outline-none
            focus:ring-2
            focus:ring-blue-300
          "
        >
          ＋ 予約を追加
        </button>

        {/* 日付切り替え */}
        <div className="flex items-center gap-3">

          <button
            aria-label="前の日へ"
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-lg text-slate-700
              shadow-sm
              transition
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-700
            "
            onClick={() => {
              const newDate = new Date(date);
              newDate.setDate(date.getDate() - 1);
              setDate(newDate);
            }}
          >
            ‹
          </button>

          <div className="min-w-[220px] text-center">
            <div className="text-lg font-semibold tracking-wide text-slate-900">
              {date.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </div>
          </div>

          <button
            aria-label="次の日へ"
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-lg text-slate-700
              shadow-sm
              transition
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-700
            "
            onClick={() => {
              const newDate = new Date(date);
              newDate.setDate(date.getDate() + 1);
              setDate(newDate);
            }}
          >
            ›
          </button>
        </div>

        {/* カレンダー */}
        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="
              rounded-xl
              border border-slate-200
              bg-white
              px-5 py-3
              text-sm font-medium
              text-slate-700
              shadow-sm
              transition
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            <span className="mr-2">▣</span>
            カレンダー
          </button>

          {showCalendar && (
            <div className="absolute right-0 top-14 z-50 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <ReservationCalendar
                date={date}
                setDate={setDate}
                onClose={() => setShowCalendar(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 顧客検索 */}
      <div className="relative mb-6">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
          ⌕
        </span>

        <input
          type="text"
          placeholder="顧客名で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-white
            py-3.5 pl-11 pr-4
            text-sm
            text-slate-800
            shadow-sm
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-blue-400
            focus:ring-2
            focus:ring-blue-100
          "
        />
      </div>

      {/* タイムテーブル */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "90px minmax(0, 1fr) minmax(0, 1fr)",
        }}
      >

          {/* タイムテーブルヘッダー */}
          <div className="border-b border-slate-200 bg-slate-800 px-4 py-3 text-sm font-semibold text-white">
            時間
          </div>

          <div className="border-b border-l border-slate-700 bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white">
            Aレーン
          </div>

          <div className="border-b border-l border-slate-700 bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white">
            Bレーン
          </div>

          {/* 時間ごとの行 */}
          {times.map((time) => (
            <React.Fragment key={time}>

              {/* 時間 */}
              <div className="min-w-0 flex h-12 items-start border-b border-slate-200 bg-slate-50 px-4 pt-3 text-sm font-medium text-slate-600">
                {time}
              </div>

              {/* Aレーン */}
              <div className="relative min-w-0 h-12 border-b border-l border-slate-200 bg-white p-1.5">
                {reservations
                  .filter(
                    (r) =>
                      r.startTime === time &&
                      r.lane === "A" &&
                      r.date === selectedDate &&
                      r.customer
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((r) => (
                    <div
                      key={r.id}
                      className={`min-w-0 w-full cursor-pointer rounded-xl border border-l-4 p-3 text-slate-800 shadow-sm transition hover:shadow-md ${
                        r.status === "completed"
                          ? "border-slate-200 border-l-slate-400 bg-slate-100"
                          : r.status === "cancelled"
                          ? "border-red-200 border-l-red-400 bg-red-50"
                          : "border-blue-200 border-l-blue-500 bg-blue-50"
                      }`}
                      style={{
                        height: `${getRowSpan(
                          r.startTime,
                          r.endTime
                        ) * 48}px`,
                      }}
                      onClick={() => {
                        setSelectedReservation(r);
                        setIsCustomerModalOpen(true);
                      }}
                    >
                      {/* 会計済み */}
                      {r.status === "completed" ? (
                        <>
                          <div className="text-base font-semibold tracking-tight text-slate-700">
                            ✓ {r.customer}
                          </div>

                          <div className="mt-2 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            会計済み
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 顧客名 */}
                          <div className="text-base font-semibold tracking-tight text-slate-900">
                            {r.customer}
                          </div>

                          {/* 時間 */}
                          <div className="mt-1 text-sm text-slate-500">
                            {r.startTime} - {r.endTime}
                          </div>

                          {/* メニュー */}
                          <div className="mt-1 text-xs text-slate-600">
                            {r.menu}
                          </div>

                          {/* ステータス */}
                          <div className="mt-2 flex justify-end">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                r.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {r.status === "reserved" &&
                                "予約中"}

                              {r.status === "cancelled" &&
                                "キャンセル"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>

              {/* Bレーン */}
              <div className="relative min-w-0 h-12 border-b border-l border-slate-200 bg-white p-1.5">
                {reservations
                  .filter(
                    (r) =>
                      r.startTime === time &&
                      r.lane === "B" &&
                      r.date === selectedDate &&
                      r.customer
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((r) => (
                    <div
                      key={r.id}
                      className={`min-w-0 w-full cursor-pointer rounded-xl border border-l-4 p-3 text-slate-800 shadow-sm transition hover:shadow-md ${
                        r.status === "completed"
                          ? "border-slate-200 border-l-slate-400 bg-slate-100"
                          : r.status === "cancelled"
                          ? "border-red-200 border-l-red-400 bg-red-50"
                          : "border-blue-200 border-l-blue-500 bg-blue-50"
                      }`}
                      style={{
                        height: `${getRowSpan(
                          r.startTime,
                          r.endTime
                        ) * 48}px`,
                      }}
                      onClick={() => {
                        setSelectedReservation(r);
                        setIsCustomerModalOpen(true);
                      }}
                    >
                      {/* 会計済み */}
                      {r.status === "completed" ? (
                        <>
                          <div className="text-base font-semibold tracking-tight text-slate-700">
                            ✓ {r.customer}
                          </div>

                          <div className="mt-2 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            会計済み
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 顧客名 */}
                          <div className="text-base font-semibold tracking-tight text-slate-900">
                            {r.customer}
                          </div>

                          {/* 時間 */}
                          <div className="mt-1 text-sm text-slate-500">
                            {r.startTime} - {r.endTime}
                          </div>

                          {/* メニュー */}
                          <div className="mt-1 text-xs text-slate-600">
                            {r.menu}
                          </div>

                          {/* ステータス */}
                          <div className="mt-2 flex justify-end">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                r.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {r.status === "reserved" &&
                                "予約中"}

                              {r.status === "cancelled" &&
                                "キャンセル"}
                            </span>
                          </div>
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