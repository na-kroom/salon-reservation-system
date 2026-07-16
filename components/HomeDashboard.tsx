import type { Reservation } from "@/types/Reservation";

type HomeDashboardProps = {
  todayReservationCount: number;
  todaySales: number;
  monthlySales: number;
  customerCount: number;
  todayReservations: Reservation[];
};
export default function HomeDashboard({
  todayReservationCount,
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
            {todayReservations.map((reservation) => (
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
                </div>
            ))}
            </div>
        )}
        </div>
      </div>
    </div>
  );
}