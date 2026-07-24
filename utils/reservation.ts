import type { Reservation } from "@/types/Reservation";

type CreateReservationParams = {
  customerId: number;
  customer: string;
  lane: string;
  date: string;
  startTime: string;
  endTime: string;
  menu: string;
  price: number;
  memo: string;
  product: string;
  quantity: number;
  
  status: "reserved" | "completed" | "cancelled";

};

export const createReservation = (
  params: CreateReservationParams
): Reservation => {
  return {
    id: Date.now(),

    customerId: params.customerId,
    customer: params.customer,

    lane: params.lane,
    date: params.date,

    startTime: params.startTime,
    endTime: params.endTime,

    menu: params.menu,

    price: params.price,

    memo: params.memo,

    product: params.product,

    quantity: params.quantity,

    status: params.status,
  };

};
export const updateReservation = (
  reservation: Reservation,
  data: Partial<Reservation>
): Reservation => {
  return {
    ...reservation,
    ...data,
  };
};