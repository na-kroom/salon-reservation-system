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
      {/* 日付切替 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
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

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-blue-50"
        >
          📅
        </button>
      </div>
      <div className="relative mb-6">
        {showCalendar && (
          <div className="absolute right-0 top-12 z-50 w-[340px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
          <ReservationCalendar
            date={date}
            setDate={setDate}
            onClose={() => setShowCalendar(false)}
          />
          </div>
        )}
      </div>

      {/* 予約追加 */}
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-black px-4 py-2 text-white"
        >
          ＋予約追加
        </button>
      </div>

      {/* 顧客検索 */}
      <input
        type="text"
        placeholder="顧客検索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 mb-4"
      />

      {/* タイムテーブル */}
      <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
        <div className="font-bold">Time</div>
        <div className="font-bold text-center">A Lane</div>
        <div className="font-bold text-center">B Lane</div>
      
        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="border p-2">{time}</div>

            <div className="border p-2 h-12">
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
                    className={`cursor-pointer rounded p-2 text-white ${
                    r.status === "completed"
                      ? "bg-gray-400"
                      : r.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-blue-500"
                    }`}
                    style={{
                      height: `${getRowSpan(r.startTime, r.endTime) * 48}px`,
                    }}
                      onClick={() => {
                        setSelectedReservation(r);
                        setIsCustomerModalOpen(true);
                      }}
                      >
                      {r.status === "completed" ? (
                        <>
                          <div className="font-medium">
                            ✓ {r.customer}
                          </div>

                          <div className="text-xs text-gray-100">
                            会計済み
                          </div>
                        </>
                      ) : (
                        <>
                          <div>{r.customer}</div>

                          <div className="text-xs">
                            {r.startTime}〜{r.endTime}
                          </div>

                          <div className="text-xs text-white/80">
                            {r.menu}
                          </div>

                          <div className="text-xs font-semibold">
                            {r.status === "reserved" && "🟡 予約中"}
                            {r.status === "cancelled" && "🔴 キャンセル"}
                          </div>
                        </>
                      )}
                      </div>
                    ))}
            </div>
            <div className="border p-2 h-12">
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
                    className={`cursor-pointer rounded p-2 text-white ${
                    r.status === "completed"
                      ? "bg-gray-400"
                      : r.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-blue-500"
                    }`}
                    style={{
                      height: `${getRowSpan(r.startTime, r.endTime) * 48}px`,
                    }}
                    onClick={() => {
                      setSelectedReservation(r);
                      setIsCustomerModalOpen(true);
                    }}
                  >
                  {r.status === "completed" ? (
                    <>
                      <div className="font-medium">
                        ✓ {r.customer}
                      </div>

                      <div className="text-xs text-gray-100">
                        会計済み
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{r.customer}</div>

                      <div className="text-xs">
                        {r.startTime}〜{r.endTime}
                      </div>

                      <div className="text-xs text-white/80">
                        {r.menu}
                      </div>

                      <div className="text-xs font-semibold">
                        {r.status === "reserved" && "🟡 予約中"}
                        {r.status === "cancelled" && "🔴 キャンセル"}
                      </div>
                    </>
                  )}
                  </div>
                ))}

            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}