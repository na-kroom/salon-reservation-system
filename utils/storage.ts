import type { Reservation } from "@/types/Reservation";

export const saveReservations = (
  reservations: Reservation[]
) => {
  localStorage.setItem(
    "reservations",
    JSON.stringify(reservations)
  );
};

export const loadReservations = () => {
  const saved =
    localStorage.getItem("reservations");

  if (!saved) {
    return null;
  }

  return JSON.parse(saved) as Reservation[];
};