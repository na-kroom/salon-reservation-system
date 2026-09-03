import type { Reservation } from "@/types/Reservation";
import { deleteReservation } from "@/utils/reservationApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedReservation: Reservation | null;
  visitCount: number;
  totalSales: number;
  lastVisit: string;
  reservations: Reservation[];
    setSelectedReservation: React.Dispatch<
    React.SetStateAction<Reservation | null>
    >
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
      <div className="space-y-6">

        {/* 今回の予約 */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              予約詳細
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedReservation.status === "completed"
                  ? "bg-slate-200 text-slate-600"
                  : selectedReservation.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {selectedReservation.status === "completed"
                ? "会計済み"
                : selectedReservation.status === "cancelled"
                ? "キャンセル"
                : "予約中"}
            </span>
          </div>

          {/* 顧客名 */}
          <div className="mb-5">
            <div className="text-xs text-slate-500">
              顧客名
            </div>

            <div className="mt-1 text-xl font-bold text-slate-900">
              {selectedReservation.customer}
            </div>
          </div>

          {/* 予約情報 */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <div className="text-xs text-slate-500">
                時間
              </div>

              <div className="mt-1 font-medium text-slate-900">
                {selectedReservation.startTime} -{" "}
                {selectedReservation.endTime}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                レーン
              </div>

              <div className="mt-1 font-medium text-slate-900">
                {selectedReservation.lane}レーン
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                メニュー
              </div>

              <div className="mt-1 font-medium text-slate-900">
                {selectedReservation.menu}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                料金
              </div>

              <div className="mt-1 font-medium text-slate-900">
                ¥{selectedReservation.price.toLocaleString()}
              </div>
            </div>

          </div>

          {/* メモ */}
          {selectedReservation.memo && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="text-xs text-slate-500">
                メモ
              </div>

              <div className="mt-1 text-sm text-slate-700">
                {selectedReservation.memo}
              </div>
            </div>
          )}

          {/* 商品 */}
          {selectedReservation.product && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="text-xs text-slate-500">
                商品
              </div>

              <div className="mt-1 text-sm font-medium text-slate-700">
                {selectedReservation.product}
              </div>
            </div>
          )}
        </div>

        {/* 顧客情報 */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-slate-900">
            顧客情報
          </h3>

          <div className="grid grid-cols-3 gap-3">

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">
                来店回数
              </div>

              <div className="mt-1 text-lg font-semibold text-slate-900">
                {visitCount}回
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">
                累計売上
              </div>

              <div className="mt-1 text-lg font-semibold text-slate-900">
                ¥{totalSales.toLocaleString()}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">
                前回来店
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-900">
                {lastVisit}
              </div>
            </div>

          </div>
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
        onClick={async () => {
          if (!selectedReservation) return;

          if (
            !confirm("この予約を削除しますか？")
          ) {
            return;
          }

          try {
            await deleteReservation(
              selectedReservation.id
            );

            setReservations((prev) =>
              prev.filter(
                (reservation) =>
                  reservation.id !== selectedReservation.id
              )
            );

            setSelectedReservation(null);
            onClose();
          } catch (error) {
            console.error(
              "予約削除に失敗しました",
              error
            );
            alert("予約削除に失敗しました。");
            return;
          }
        }}
          className="rounded bg-orange-500 px-4 py-2 text-white"
        >
          キャンセル
        </button>

        <button
        onClick={async () => {
          if (!selectedReservation) return;

          if (
            !confirm("この予約を削除しますか？")
          ) {
            return;
          }

          try {
            await deleteReservation(
              selectedReservation.id
            );

            setReservations((prev) =>
              prev.filter(
                (reservation) =>
                  reservation.id !== selectedReservation.id
              )
            );

            setSelectedReservation(null);
            onClose();
          } catch (error) {
            console.error(
              "予約削除に失敗しました",
              error
            );
            alert("予約削除に失敗しました。");
            return;
          }
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
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime()
          )
          .map((r) => (
          <div
            key={r.id}
            className="border-b border-slate-200 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {r.date}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  {r.menu}
                </div>
              </div>

              <div className="text-sm font-semibold text-slate-900">
                ¥{r.price.toLocaleString()}
              </div>
            </div>
          </div>
          ))}
      </div>
        
      </div>
    </div>
  );
}