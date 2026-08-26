import type { Reservation } from "@/types/Reservation";
import { timeToMinutes } from "@/utils/time";

type CheckReservationOverlapParams = {
  reservations: Reservation[];
  date: string;
  lane: string;
  startTime: string;
  endTime: string;
  excludeReservationId?: number;
};

export const isReservationOverlap = ({
  reservations,
  date,
  lane,
  startTime,
  endTime,
  excludeReservationId,
}: CheckReservationOverlapParams): boolean => {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  return reservations.some((reservation) => {
    if (
      reservation.date !== date ||
      reservation.lane !== lane
    ) {
      return false;
    }

    if (
      excludeReservationId !== undefined &&
      reservation.id === excludeReservationId
    ) {
      return false;
    }

    const reservationStart = timeToMinutes(
      reservation.startTime
    );

    const reservationEnd = timeToMinutes(
      reservation.endTime
    );

    return (
      newStart < reservationEnd &&
      newEnd > reservationStart
    );
  });
};