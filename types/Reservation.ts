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


  status: "reserved" | "completed" | "cancelled";
};
