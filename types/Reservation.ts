export type Reservation = {
  id: number;
  customer: string;
  customerId: number;
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
