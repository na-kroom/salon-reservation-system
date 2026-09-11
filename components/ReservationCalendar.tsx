import { useState } from "react";

type Props = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  reservations: {
    date: string;
  }[];
  onClose?: () => void;
};

export default function ReservationCalendar({
  date,
  setDate,
  reservations,
  onClose,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(date);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="rounded-xl bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {year}年 {month + 1}月
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          >
            ←
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
          >
            今日
          </button>

          <button
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div
            key={day}
            className="py-1 text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, index) => {
          const day = index - firstDay + 1;

          if (day < 1 || day > daysInMonth) {
            return (
              <div
                key={index}
                className="aspect-square rounded-md border border-gray-200 bg-gray-50"
              />
            );
          }
  const dayDate = new Date(year, month, day);

  const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const hasReservation = reservations.some(
    (reservation) => reservation.date === dayString
  );

  const isSelected =
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day;    
       
  return (
    <button
      key={index}
      onClick={() => {
        setDate(dayDate);
        onClose?.();
      }}
      className={`relative aspect-square rounded-md border text-sm transition
        ${
          isSelected
            ? "border-blue-600 bg-blue-600 text-white"
            : hasReservation
            ? "border-blue-200 bg-blue-50 text-blue-900"
            : "border-gray-200 bg-white text-slate-700"
        }
        hover:border-blue-400 hover:bg-blue-50
      `}
    >
      {day}

      {hasReservation && !isSelected && (
        <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-600" />
      )}
    </button>
  );        
        })}
      </div>
    </div>
  );
}