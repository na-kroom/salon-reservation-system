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
      <h2 className="text-2xl font-bold mb-6">
        ダッシュボード
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 shadow">
          <p className="text-gray-500">
            今日の予約
          </p>

          <p className="text-2xl font-bold">
            {todayReservationCount}件
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <p className="text-gray-500">
            今日の売上
          </p>

          <p className="text-2xl font-bold">
            ¥{todaySales.toLocaleString()}
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <p className="text-gray-500">
            今月売上
          </p>

          <p className="text-2xl font-bold">
            ¥{monthlySales.toLocaleString()}
          </p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <p className="text-gray-500">
            登録顧客
          </p>

          <p className="text-2xl font-bold">
            {customerCount}人
          </p>
        </div>
        <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
            今日の予約一覧
        </h3>

        {todayReservations.length === 0 ? (
            <p className="text-gray-500">
            今日の予約はありません。
            </p>
        ) : (
            <div className="space-y-3">
            {todayReservations.map((reservation) => (
                <div
                key={reservation.id}
                className="border rounded-lg p-4"
                >
                <div className="font-bold">
                    {reservation.startTime}
                </div>

                <div>
                    {reservation.customer}
                </div>

                <div className="text-gray-500">
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