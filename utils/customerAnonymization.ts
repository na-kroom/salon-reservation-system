import type { Customer } from "@/types/Customer";
import type { Reservation } from "@/types/Reservation";

export type AnonymizationCandidate = {
  customer: Customer;
  lastVisit: string;
};

// 3年以上前の日付を取得
const getThreeYearsAgo = (): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 3);
  return date;
};

// 最終来店日を取得
const getLastCompletedVisit = (
  reservations: Reservation[],
  customerId: number
): string | null => {
  const completedReservations = reservations
    .filter(
      (reservation) =>
        reservation.customerId === customerId &&
        reservation.status === "completed"
    )
    .map((reservation) => {
      const date = reservation.completedAt
        ? new Date(reservation.completedAt)
        : new Date(`${reservation.date}T12:00:00`);

      return {
        date,
        dateString: [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-"),
      };
    })
    .filter((reservation) => !Number.isNaN(reservation.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return completedReservations[0]?.dateString ?? null;
};

// 匿名化候補を抽出
export const getAnonymizationCandidates = (
  customers: Customer[],
  reservations: Reservation[]
): AnonymizationCandidate[] => {
  const threeYearsAgo = getThreeYearsAgo();

  return customers
    .filter(
      (customer) =>
        !customer.isArchived &&
        !customer.isProvisional &&
        customer.name !== "削除済み顧客"
    )
    .map((customer) => {
      const lastVisit = getLastCompletedVisit(
        reservations,
        customer.id
      );

      return {
        customer,
        lastVisit,
      };
    })
    .filter(
      (
        candidate
      ): candidate is AnonymizationCandidate =>
        candidate.lastVisit !== null &&
        new Date(`${candidate.lastVisit}T12:00:00`) <= threeYearsAgo
    )
    .sort(
      (a, b) =>
        new Date(a.lastVisit).getTime() -
        new Date(b.lastVisit).getTime()
    );
};