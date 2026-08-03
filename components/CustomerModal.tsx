import type { Reservation } from "@/types/Reservation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedReservation: Reservation | null;
  visitCount: number;
  totalSales: number;
  lastVisit: string;
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
}: Props) {
  if (!isOpen || !selectedReservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[500px] rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">
          顧客カルテ
        </h2>

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
        <div className="mt-6 flex gap-2">
        <button
        onClick={() => {
            setSelectedReservation(selectedReservation);
            setIsEditing(true);
            onClose();
        }}
        className="rounded bg-blue-500 px-4 py-2 text-white"
        >
        編集
        </button>
        <button
            className="rounded bg-red-500 px-4 py-2 text-white"
        >
            キャンセル
        </button>

        <button
            className="rounded bg-gray-600 px-4 py-2 text-white"
        >
            削除
        </button>
        </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 rounded border px-4 py-2"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}