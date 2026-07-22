import { useState } from "react";

type Props = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  onClose?: () => void;
};

export default function ReservationCalendar({
  date,
  setDate,
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

          return (
            <button
              key={index}
              onClick={() => {
                setDate(new Date(year, month, day));
                onClose?.();
              }}
              className="aspect-square rounded-md border border-gray-200 bg-white text-sm hover:border-blue-400 hover:bg-blue-50"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}