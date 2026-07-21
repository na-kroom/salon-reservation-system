import { useState } from "react";


type Props = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
};

export default function ReservationCalendar({
  date,
  setDate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(date);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();
  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
     

        <h2 className="text-xl font-semibold">
          {currentMonth.getFullYear()}年
          {currentMonth.getMonth() + 1}月
        </h2>

        <div className="flex gap-2">
        <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            ←
          </button> 
          <button onClick={() => setCurrentMonth(new Date())}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            今日
          </button>
          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
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
      <>
        {Array.from({ length: firstDay }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square rounded-xl border border-gray-200 bg-gray-50"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => (
        <button
          key={index}
          onClick={() =>
            setDate(new Date(year, month, index + 1))
          }
            className="aspect-square rounded-xl border border-gray-200 bg-white transition hover:border-blue-400 hover:bg-blue-50"
          >
            {index + 1}
          </button>
        ))}
      </>     
      </div>
    </div>
  );
}