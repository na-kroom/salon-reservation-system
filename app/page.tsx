"use client";

import React, { useState } from "react";


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


  const [reservations, setReservations] = useState([
  {
    time: "11:00",
    lane: "A",
    customer: "田中",
    date: "2026-06-08",
  },
]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [customer, setCustomer] = useState("");
  const [time, setTime] = useState("10:00");
  const [lane, setLane] = useState("A");
  
  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Salon Reservation System
      </h1>

      <div className="mb-6 flex items-center gap-4">
       <button
          className="border px-3 py-1 rounded"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() - 1);
            setDate(newDate);
          }}
        >
          ◀
        </button> 

        <span className="font-semibold">
          {date.toLocaleDateString("ja-JP")}  
        </span>

       <button
          className="border px-3 py-1 rounded"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + 1);
            setDate(newDate);
          }}
        >
          ▶
        </button>
      </div>

      <div className="mb-6">
       <button
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-black px-4 py-2 text-white"
        >
          ＋予約追加
        </button>
        
      
      </div>

        <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
        <div className="font-bold">Time</div>
        <div className="font-bold text-center">A Lane</div>
        <div className="font-bold text-center">B Lane</div>

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="border p-2">
              {time}
            </div>
            <div className="border p-2 h-12">
              {reservations
                .filter(
                  (r) =>
                    r.time === time &&
                    r.lane === "A" &&
                    r.date === date.toISOString().split("T")[0]
                )
                .map((r) => (
                  <div
                    key={r.customer}
                    className="cursor-pointer"
                    onClick={() => {
                      if (confirm("削除しますか？")) {
                        setReservations(
                          reservations.filter(
                            (reservation) => reservation !== r
                          )
                        );
                      }
                    }}
                  >
                    {r.customer}
                  </div>
                ))}
            </div>
  
           <div className="border p-2 h-12">
            {reservations
              .filter(
                (r) =>
                  r.time === time &&
                  r.lane === "B" &&
                  r.date === date.toISOString().split("T")[0]
              )
              .map((r) => (
                <div
                  key={r.customer}
                  className="cursor-pointer"
                  onClick={() => {
                    if (confirm("削除しますか？")) {
                      setReservations(
                        reservations.filter(
                          (reservation) => reservation !== r
                        )
                      );
                    }
                  }}
                >
                  {r.customer}
                </div>
              ))}
          </div>

          </React.Fragment>
        ))}
      </div>
      {isModalOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">
            予約登録
          </h2>

          <input
            type="text"
            placeholder="お客様名"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="border p-2 w-full mb-3"
          />

          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border p-2 w-full mb-3"
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="border p-2 w-full mb-4"
          >
            <option value="A">Aレーン</option>
            <option value="B">Bレーン</option>
          </select>

          <button
            onClick={() => {
              setReservations([
                ...reservations,
                {
                  customer,
                  time,
                  lane,
                  date: date.toISOString().split("T")[0],
                },
              ]);

              setCustomer("");
              setTime("10:00");
              setLane("A");

              setIsModalOpen(false);
            }}
            className="bg-black text-white px-4 py-2 rounded mr-2"
          >
            登録
          </button>

          <button
            onClick={() => setIsModalOpen(false)}
            className="border px-3 py-1 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
    )}
    </main>
  );
}
