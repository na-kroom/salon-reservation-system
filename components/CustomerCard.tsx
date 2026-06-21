import type { Reservation } from "@/types/Reservation";

type Props = {
  selectedReservation: Reservation | null;
};

export default function CustomerCard({
  selectedReservation,
}: Props) {
  if (!selectedReservation) return null;

  return (
    <div className="border p-4 mb-4">
      <h2 className="font-bold text-lg">
        顧客カルテ
      </h2>

      <div>
        顧客名:
        {selectedReservation.customer}
      </div>

      <div>
        メニュー:
        {selectedReservation.menu}
      </div>

      <div>
        料金:
        ¥{selectedReservation.price}
      </div>
    </div>
  );
}