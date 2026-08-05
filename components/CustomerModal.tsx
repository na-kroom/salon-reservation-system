import type { Reservation } from "@/types/Reservation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedReservation: Reservation | null;
  visitCount: number;
  totalSales: number;
  lastVisit: string;
  reservations: Reservation[];
  setIsEditing: React.Dispatch<
    React.SetStateAction<boolean>
    >;
    setSelectedReservation: React.Dispatch<
    React.SetStateAction<Reservation | null>
    >;
    setEditingId: React.Dispatch<
    React.SetStateAction<number | null>
    >;

    setCustomerId: React.Dispatch<
    React.SetStateAction<number | null>
    >;

    setCustomer: React.Dispatch<
    React.SetStateAction<string>
    >;

    setMenu: React.Dispatch<
    React.SetStateAction<string>
    >;

    setPrice: React.Dispatch<
    React.SetStateAction<string>
    >;

    setMemo: React.Dispatch<
    React.SetStateAction<string>
    >;

    setIsModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
    >;
    setReservations: React.Dispatch<
      React.SetStateAction<Reservation[]>
    >;
};

export default function CustomerModal({
  isOpen,
  onClose,
  selectedReservation,
  visitCount,
  totalSales,
  lastVisit,
  setIsEditing,
  setSelectedReservation,
  setEditingId,
  setCustomerId,
  setCustomer,
  setMenu,
  setPrice,
  setMemo,
  setReservations,
  reservations,
  setIsModalOpen
  }: Props) {
  if (!isOpen || !selectedReservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[650px] max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          顧客カルテ
        </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
        <div>
            <span className="font-semibold">
            顧客名：
            </span>
            {selectedReservation.customer}
        </div>
        <div>
        <span className="font-semibold">
            来店回数：
        </span>
        {visitCount}回
        </div>

        <div>
        <span className="font-semibold">
            累計売上：
        </span>
        ¥{totalSales.toLocaleString()}
        </div>

        <div>
        <span className="font-semibold">
            前回来店日：
        </span>
        {lastVisit}
        </div>

        <div>
            <span className="font-semibold">
            メニュー：
            </span>
            {selectedReservation.menu}
        </div>

        <div>
            <span className="font-semibold">
            料金：
            </span>
            ¥{selectedReservation.price}
        </div>
        <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => {
            if (!selectedReservation) return;

            setEditingId(selectedReservation.id);

            setCustomerId(selectedReservation.customerId);
            setCustomer(selectedReservation.customer);
            setMenu(selectedReservation.menu);
            setPrice(
              String(selectedReservation.price)
            );
            setMemo(selectedReservation.memo);

            setIsModalOpen(true);
            onClose();
          }}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          編集
        </button>
        <button
          onClick={() => {
            if (!selectedReservation) return;

            if (
              !confirm("この予約をキャンセルしますか？")
            ) {
              return;
            }

            setReservations((prev) =>
              prev.map((reservation) =>
                reservation.id === selectedReservation.id
                  ? {
                      ...reservation,
                      status: "cancelled",
                    }
                  : reservation
              )
            );

            setSelectedReservation({
              ...selectedReservation,
              status: "cancelled",
            });

            onClose();
          }}
          className="rounded bg-orange-500 px-4 py-2 text-white"
        >
          キャンセル
        </button>

        <button
          onClick={() => {
            if (!selectedReservation) return;

            if (
              !confirm("この予約を削除しますか？")
            ) {
              return;
            }

            setReservations((prev) =>
              prev.filter(
                (reservation) =>
                  reservation.id !== selectedReservation.id
              )
            );

            setSelectedReservation(null);
            onClose();
          }}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          削除
        </button>
        </div>
        </div>

        <div className="mt-6">
        <h3 className="mb-2 font-bold">
          購入履歴
        </h3>

        {reservations
          .filter(
            (r) =>
              r.customer ===
                selectedReservation.customer &&
              r.product
          )
          .map((r) => (
            <div
              key={r.id}
              className="border-b py-2"
            >
              {r.product}
              （{r.quantity}個）
            </div>
          ))}
      </div>
      <div className="mt-6">
        <h3 className="mb-2 font-bold">
          来店履歴
        </h3>

        {reservations
          .filter(
            (r) =>
              r.customer ===
              selectedReservation.customer
          )
          .map((r) => (
            <div
              key={r.id}
              className="border-b py-2"
            >
              <div>{r.date}</div>

              <div>{r.menu}</div>

              <div>
                ¥{r.price.toLocaleString()}
              </div>
            </div>
          ))}
      </div>
        
      </div>
    </div>
  );
}