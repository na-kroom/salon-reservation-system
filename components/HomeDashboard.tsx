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
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 font-bold mb-6">
        ダッシュボード
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            今日の予約
          </p>

          <p className="text-3xl font-bold text-gray-800 font-bold">
            {todayReservationCount}件
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            会計済み
          </p>

          <p className="text-3xl font-bold text-green-600">
            {completedCount}件
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            今日の売上
          </p>

          <p className="text-3xl font-bold text-gray-800 font-bold">
            ¥{todaySales.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            今月売上
          </p>

          <p className="text-3xl font-bold text-gray-800 font-bold">
            ¥{monthlySales.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            登録顧客
          </p>

          <p className="text-3xl font-bold text-gray-800 font-bold">
            {customerCount}人
          </p>
        </div>
        <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
            今日の予約一覧
        </h3>

        {todayReservations.length === 0 ? (
            <p className="text-sm text-gray-500">
            今日の予約はありません。
            </p>
        ) : (
            <div className="space-y-3">
            {[...todayReservations]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((reservation) => (
                <div
                key={reservation.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                <div className="text-lg font-semibold text-gray-800">
                    {reservation.startTime}
                </div>

                <div>
                    {reservation.customer}
                </div>

                <div className="text-sm text-gray-500">
                    {reservation.menu}
                </div>
                <div className="mt-1">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {reservation.lane}レーン
                  </span>
                </div>
                <div className="mt-2">
                  <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${
                    reservation.status === "completed"
                      ? "bg-green-500"
                      : reservation.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  >
                  {reservation.status === "completed"
                    ? "会計済み"
                    : reservation.status === "cancelled"
                    ? "キャンセル"
                    : "予約中"}
                  </span>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
      </div>
    </div>
  );
}