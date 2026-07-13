import type { Reservation } from "@/types/Reservation";

export const calculateTodaySales = (
  reservations: Reservation[],
  date: Date
) => {
  return reservations
    .filter(
      (r) =>
        r.date ===
        date.toISOString().split("T")[0]
    )
    .reduce(
      (sum, r) => sum + (r.price || 0),
      0
    );
};

export const calculateMonthlySales = (
  reservations: Reservation[],
  date: Date
) => {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  return reservations
    .filter((r) => {
      const reservationDate = new Date(r.date);

      return (
        reservationDate.getMonth() ===
          currentMonth &&
        reservationDate.getFullYear() ===
          currentYear
      );
    })
    .reduce(
      (sum, r) => sum + r.price,
      0
    );
};