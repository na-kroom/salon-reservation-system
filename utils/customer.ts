import type { Reservation } from "@/types/Reservation";

export const getVisitCount = (
  reservations: Reservation[],
  customer: string
) => {
  return reservations.filter(
    (r) => r.customer === customer
  ).length;
};

export const getTotalSales = (
  reservations: Reservation[],
  customer: string
) => {
  return reservations
    .filter(
      (r) => r.customer === customer
    )
    .reduce(
      (sum, r) => sum + r.price,
      0
    );
};

export const getLastVisit = (
  reservations: Reservation[],
  customer: string
) => {
  return (
    reservations
      .filter(
        (r) => r.customer === customer
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )[0]?.date ?? "-"
  );
};