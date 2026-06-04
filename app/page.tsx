import React from "react";

export default function Home() {
  const times = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Salon Reservation System
      </h1>

      <div className="mb-6 flex items-center gap-4">
        <button className="border px-3 py-1 rounded">
          ◀
        </button>

        <span className="font-semibold">
          2026/06/02
        </span>

        <button className="border px-3 py-1 rounded">
          ▶
        </button>
      </div>

      <div className="mb-6">
        <button className="rounded bg-black px-4 py-2 text-white">
          ＋ 予約追加
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="font-bold">Time</div>
        <div className="font-bold text-center">A Lane</div>
        <div className="font-bold text-center">B Lane</div>

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="border p-2">
              {time}
            </div>

            <div className="border p-2 h-12" />

            <div className="border p-2 h-12" />
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
