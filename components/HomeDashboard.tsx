import { useState } from "react";
import type { Reservation } from "@/types/Reservation";

  type HomeDashboardProps = {
    todayReservationCount: number;
    completedCount: number;
    todaySales: number;
    monthlySales: number;
    customerCount: number;
    todayReservations: Reservation[];
  };

export default function HomeDashboard({
  todayReservationCount,
  completedCount,
  todaySales,
  monthlySales,
  customerCount,
  todayReservations,
}: HomeDashboardProps){

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 font-bold mb-6">
        ダッシュボード
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">
            今日の予約
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {todayReservationCount}件
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">
            会計済み
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedCount}件
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">
            今日の売上
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ¥{todaySales.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">
            今月売上
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ¥{monthlySales.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">
              登録顧客
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {customerCount}人
            </p>
          </div>

        <div className="mt-8">
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            今日の予約一覧
          </h3>

          {todayReservations.length === 0 ? (
            <p className="text-sm text-gray-500">
              今日の予約はありません。
            </p>
          ) : (
            <div className="space-y-2">
              {[...todayReservations]
                .sort((a, b) =>
                  a.startTime.localeCompare(b.startTime)
                )
                .map((reservation) => (
                  <div key={reservation.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedReservation(
                          selectedReservation?.id === reservation.id
                            ? null
                            : reservation
                        )
                      }
                    
                    className="group flex w-full items-center gap-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span className="w-16 text-sm font-semibold text-slate-800">
                        {reservation.startTime}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          reservation.status === "completed"
                            ? "bg-green-500"
                            : reservation.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="flex-1 text-sm font-medium text-slate-800">
                        {reservation.customer}
                      </span>
                      <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                        ›
                      </span>
                    </button>
                  {selectedReservation?.id === reservation.id && (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <h4 className="mb-4 text-base font-semibold text-slate-900">
                        予約詳細
                      </h4>

                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="mr-4 text-slate-500">お客様</span>
                          <span className="font-medium text-slate-900">
                            {reservation.customer}
                          </span>
                        </p>

                        <p>
                          <span className="mr-4 text-slate-500">メニュー</span>
                          <span className="font-medium text-slate-900">
                            {reservation.menu}
                          </span>
                        </p>

                        <p>
                          <span className="mr-4 text-slate-500">開始時間</span>
                          <span className="font-medium text-slate-900">
                            {reservation.startTime}
                          </span>
                        </p>

                        <p>
                          <span className="mr-4 text-slate-500">レーン</span>
                          <span className="font-medium text-slate-900">
                            {reservation.lane}レーン
                          </span>
                        </p>

                        <p>
                          <span className="mr-4 text-slate-500">ステータス</span>
                          <span className="font-medium text-slate-900">
                            {reservation.status === "completed"
                              ? "会計済み"
                              : reservation.status === "cancelled"
                              ? "キャンセル"
                              : "予約中"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                ))}
            </div>
          )}
        </div>      
      </div>
    </div>
  );
}