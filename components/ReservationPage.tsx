import React from "react";
import type { Reservation } from "@/types/Reservation";
import type { Customer } from "@/types/Customer";
import ReservationCalendar from "@/components/ReservationCalendar";
type ReservationPageProps = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;

  setIsModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  searchTerm: string;
  setSearchTerm: React.Dispatch<
    React.SetStateAction<string>
  >;

  times: string[];
  reservations: Reservation[];
  customers: Customer[];
  selectedDate: string;

  setSelectedReservation: React.Dispatch<
    React.SetStateAction<Reservation | null>
  >;

  setIsEditing: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

export default function ReservationPage({
  date,
  setDate,
  setIsModalOpen,
  searchTerm,
  setSearchTerm,
  times,
  reservations,
  selectedDate,
  customers,
  setSelectedReservation,
  setIsEditing,
}: ReservationPageProps) {
  return (
    <>
      {/* 日付切替 */}
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

      <ReservationCalendar />

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
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedReservation(r);
                      setIsEditing(true);
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
                    r.startTime === time &&
                    r.lane === "B" &&
                    r.date === selectedDate &&
                    r.customer
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((r) => (
                  <div key={r.id} className="cursor-pointer">
                    <div>{r.customer}</div>

                    <div className="text-xs">
                      {r.startTime}〜{r.endTime}
                    </div>

                    <div className="text-xs text-gray-500">
                      {r.menu}
                    </div>
                  </div>
                ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}