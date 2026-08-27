import { supabase } from "./supabase";
import type { Reservation } from "@/types/Reservation";


export async function fetchReservations(): Promise<Reservation[]> {
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
  export async function createReservation(
    reservation: Omit<Reservation, "id">
  ): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      lane: reservation.lane,
      customer_id: reservation.customerId,
      customer: reservation.customer,
      date: reservation.date,
      start_time: reservation.startTime,
      end_time: reservation.endTime,
      menu: reservation.menu,
      price: reservation.price,
      memo: reservation.memo,
      product: reservation.product,
      quantity: reservation.quantity,
      status: reservation.status,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    lane: data.lane,
    customerId: data.customer_id,
    customer: data.customer,
    date: data.date,
    startTime: data.start_time.slice(0, 5),
    endTime: data.end_time.slice(0, 5),
    menu: data.menu,
    price: data.price,
    memo: data.memo ?? "",
    product: data.product ?? "",
    quantity: data.quantity,
    status: data.status,
  };
}
  export async function updateReservation(
    id: number,
    reservation: Omit<Reservation, "id">
  ): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .update({
      lane: reservation.lane,
      customer_id: reservation.customerId,
      customer: reservation.customer,
      date: reservation.date,
      start_time: reservation.startTime,
      end_time: reservation.endTime,
      menu: reservation.menu,
      price: reservation.price,
      memo: reservation.memo,
      product: reservation.product,
      quantity: reservation.quantity,
      status: reservation.status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    lane: data.lane,
    customerId: data.customer_id,
    customer: data.customer,
    date: data.date,
    startTime: data.start_time.slice(0, 5),
    endTime: data.end_time.slice(0, 5),
    menu: data.menu,
    price: data.price,
    memo: data.memo ?? "",
    product: data.product ?? "",
    quantity: data.quantity,
    status: data.status,
  };
}
export async function deleteReservation(id: number) {
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
export async function completeReservation(
  id: number
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .update({
      status: "completed",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    lane: data.lane,
    customerId: data.customer_id,
    customer: data.customer,
    date: data.date,
    startTime: data.start_time.slice(0, 5),
    endTime: data.end_time.slice(0, 5),
    menu: data.menu,
    price: data.price,
    memo: data.memo ?? "",
    product: data.product ?? "",
    quantity: data.quantity,
    status: data.status,
  };
}