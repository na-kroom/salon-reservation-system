export default function ReservationCalendar() {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button className="rounded-lg border px-3 py-2 hover:bg-gray-50">
          ←
        </button>

        <h2 className="text-xl font-semibold">
          2026年7月
        </h2>

        <div className="flex gap-2">
          <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            今日
          </button>

          <button className="rounded-lg border px-3 py-2 hover:bg-gray-50">
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {["日","月","火","水","木","金","土"].map((day) => (
          <div
            key={day}
            className="py-2 text-sm font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <button
            key={index}
            className="aspect-square rounded-xl border border-gray-200 bg-white transition hover:border-blue-400 hover:bg-blue-50"
          >
            {index + 1 <= 31 ? index + 1 : ""}
          </button>
        ))}
      </div>
    </div>
  );
}