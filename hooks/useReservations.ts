import { useEffect, useState } from "react";
import type { Reservation } from "@/types/Reservation";
import { fetchReservations } from "@/utils/reservationApi";

export function useReservations() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await fetchReservations();

        console.log(
          "Supabaseから取得した予約:",
          data
        );

        if (data) {
          setReservations(data);
        }
      } catch (error) {
        console.error(
          "予約データ取得失敗",
          error
        );
      }
    }

    loadReservations();
  }, []);

  return {
    reservations,
    setReservations,
  };
}