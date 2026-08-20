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
export async function createReservation(reservation: {
  lane: string;
  customerId: number;
  customer: string;
  date: string;
  startTime: string;
  endTime: string;
  menu: string;
  price: number;
  memo: string;
  product: string;
  quantity: number;
  status: string;
}) {
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
  reservation: {
    lane: string;
    customerId: number;
    customer: string;
    date: string;
    startTime: string;
    endTime: string;
    menu: string;
    price: number;
    memo: string;
    product: string;
    quantity: number;
    status: string;
  }
) {
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