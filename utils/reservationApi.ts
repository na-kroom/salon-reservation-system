import { supabase } from "./supabase";

export async function fetchReservations() {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("id");

  if (error) {
    throw error;
  }

  return data.map((reservation) => ({
    id: reservation.id,
    lane: reservation.lane,
    customerId: reservation.customer_id,
    customer: reservation.customer,
    date: reservation.date,
    startTime: reservation.start_time.slice(0, 5),
    endTime: reservation.end_time.slice(0, 5),
    menu: reservation.menu,
    price: reservation.price,
    memo: reservation.memo ?? "",
    product: reservation.product ?? "",
    quantity: reservation.quantity,
    status: reservation.status,
  }));
}