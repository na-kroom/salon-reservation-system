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
  customerId: number
): string => {
  const completedReservations = reservations
    .filter(
      (reservation) =>
        reservation.customerId === customerId &&
        reservation.status === "completed"
    )
    .map((reservation) => ({
      visitDate: reservation.completedAt
        ? reservation.completedAt.slice(0, 10)
        : reservation.date,
    }))
    .sort(
      (a, b) =>
        new Date(b.visitDate).getTime() -
        new Date(a.visitDate).getTime()
    );

  return completedReservations[0]?.visitDate ?? "-";
};