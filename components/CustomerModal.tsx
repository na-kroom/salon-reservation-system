import { useEffect, useState } from "react";
import type { Reservation } from "@/types/Reservation";
import type { Product, ProductCategory } from "@/types/Product";
import { deleteReservation, updateReservation } from "@/utils/reservationApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedReservation: Reservation | null;
  visitCount: number;
  totalSales: number;
  lastVisit: string;
  reservations: Reservation[];
  products: Product[];
  setProduct: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProductId: React.Dispatch<React.SetStateAction<string>>;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  setLane: React.Dispatch<React.SetStateAction<string>>;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  onOpenCustomerProfile: (customerId: number) => void;
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
  setSelectedReservation,
  setEditingId,
  setCustomerId,
  setCustomer,
  setMenu,
  setPrice,
  setMemo,
  setReservations,
  products,
  setProduct,
  setSelectedProductId,
  setDate,
  setStartTime,
  setLane,
  setDuration,
  onOpenCustomerProfile,
  setIsModalOpen
  }: Props) {
  const [inlineProduct, setInlineProduct] = useState("");
  const [inlinePrice, setInlinePrice] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [activeProductCategory, setActiveProductCategory] =
    useState<ProductCategory | "すべて">("すべて");
  const [draftProducts, setDraftProducts] = useState<Record<string, number>>({});

  const productCategories: Array<ProductCategory | "すべて"> = [
    "すべて",
    "スキンケア",
    "ヘアケア",
    "美容雑貨",
    "その他",
  ];

  const parseProductSelection = (value: string): Record<string, number> => {
    const result: Record<string, number> = {};
    value.split("、").map((part) => part.trim()).filter(Boolean).forEach((part) => {
      const match = part.match(/^(.*?)(?:\s*[×xX]\s*(\d+))?$/);
      if (!match) return;
      const name = match[1].trim();
      const quantity = Math.max(1, Number(match[2] ?? 1));
      if (name) result[name] = (result[name] ?? 0) + quantity;
    });
    return result;
  };

  const formatProductSelection = (selection: Record<string, number>) =>
    Object.entries(selection)
      .filter(([, quantity]) => quantity > 0)
      .map(([name, quantity]) => quantity > 1 ? `${name} × ${quantity}` : name)
      .join("、");

  useEffect(() => {
    if (selectedReservation) {
      const parsed = parseProductSelection(selectedReservation.product ?? "");
      setDraftProducts(parsed);
      setInlineProduct(formatProductSelection(parsed));
      setInlinePrice(String(selectedReservation.price ?? 0));
    }
  }, [selectedReservation]);

  const selectedProducts = Object.entries(draftProducts)
    .map(([name, quantity]) => ({ product: products.find((item) => item.name === name), quantity }))
    .filter((entry): entry is { product: Product; quantity: number } => Boolean(entry.product));
  const productTotal = selectedProducts.reduce(
    (sum, entry) => sum + (Number(entry.product.price) || 0) * entry.quantity,
    0
  );

  const visibleProducts = products.filter(
    (item) =>
      activeProductCategory === "すべて" ||
      item.category === activeProductCategory
  );

  // 商品の個数は編集中に保持し、「保存」で予約に反映する。
  const changeProductQuantity = (name: string, delta: number) => {
    setDraftProducts((prev) => {
      const nextQuantity = Math.max(0, (prev[name] ?? 0) + delta);
      const next = { ...prev };
      if (nextQuantity === 0) delete next[name];
      else next[name] = nextQuantity;
      return next;
    });
  };

  const saveSelectedProducts = async () => {
    if (!selectedReservation) return;
    const nextProductText = formatProductSelection(draftProducts);
    try {
      const updated = await updateReservation(selectedReservation.id, {
        ...selectedReservation,
        product: nextProductText,
      });
      setReservations((prev) => prev.map((item) => item.id === updated.id ? updated : item));
      setSelectedReservation(updated);
      setProduct(nextProductText);
      setInlineProduct(nextProductText);
      setShowProductPicker(false);
      alert("商品を保存しました。");
    } catch (error) {
      console.error("商品の保存に失敗しました", error);
      alert("商品の保存に失敗しました。");
    }
  };

  const saveInlineAccounting = async () => {
    if (!selectedReservation) return;
    try {
      const updated = await updateReservation(selectedReservation.id, {
        ...selectedReservation,
        price: Number(inlinePrice) || 0,
      });
      setReservations((prev) =>
        prev.map((item) => item.id === updated.id ? updated : item)
      );
      setSelectedReservation(updated);
      alert("施術金額を保存しました。");
    } catch (error) {
      console.error("施術金額の保存に失敗しました", error);
      alert("施術金額の保存に失敗しました。");
    }
  };

  if (!isOpen || !selectedReservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-h-[85vh] w-[650px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">予約詳細</h2>
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

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-6">

        {/* 今回の予約 */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          {/* 顧客名 */}
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">顧客名</div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {selectedReservation.customer}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = selectedReservation.customerId;
                onClose();
                onOpenCustomerProfile(id);
              }}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              顧客カルテ
            </button>
          </div>

          {/* 予約情報 */}
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div>
              <div className="text-xs text-slate-500">予約日</div>
              <div className="mt-1 font-medium text-slate-900">{selectedReservation.date}</div>
            </div>
            <div className="flex items-center gap-1.5 pb-0.5">
              <button
                type="button"
                disabled={selectedReservation.status === "cancelled" || selectedReservation.status === "completed"}
                onClick={async () => {
                  if (!confirm("この予約をキャンセルしますか？")) return;
                  try {
                    const updated = await updateReservation(selectedReservation.id, {
                      ...selectedReservation,
                      status: "cancelled",
                    });
                    setReservations((prev) => prev.map((item) => item.id === updated.id ? updated : item));
                    setSelectedReservation(updated);
                  } catch (error) {
                    console.error("予約キャンセルに失敗しました", error);
                    alert("予約キャンセルに失敗しました。");
                  }
                }}
                className="rounded-md border border-orange-200 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("この予約を削除しますか？")) return;
                  try {
                    await deleteReservation(selectedReservation.id);
                    setReservations((prev) => prev.filter((item) => item.id !== selectedReservation.id));
                    setSelectedReservation(null);
                    onClose();
                  } catch (error) {
                    console.error("予約削除に失敗しました", error);
                    alert("予約削除に失敗しました。");
                  }
                }}
                className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
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
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (!selectedReservation) return;

              setEditingId(selectedReservation.id);
              setCustomerId(selectedReservation.customerId);
              setCustomer(selectedReservation.customer);
              setMenu(selectedReservation.menu);
              setPrice(String(selectedReservation.price));
              setMemo(selectedReservation.memo);
              setProduct(selectedReservation.product ?? "");
              const matchedProduct = products.find((item) => item.name === selectedReservation.product);
              setSelectedProductId(matchedProduct ? String(matchedProduct.id) : "");
              const [year, month, day] = selectedReservation.date.split("-").map(Number);
              setDate(new Date(year, month - 1, day));
              setStartTime(selectedReservation.startTime);
              setLane(selectedReservation.lane);
              const [startHour, startMinute] = selectedReservation.startTime.split(":").map(Number);
              const [endHour, endMinute] = selectedReservation.endTime.split(":").map(Number);
              setDuration((endHour * 60 + endMinute) - (startHour * 60 + startMinute));

              setIsModalOpen(true);
              onClose();
            }}
             className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
            予約編集
          </button>
        </div>
        </div>



        {/* 商品と施術金額は別々に管理 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">商品</h3>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              {Object.keys(draftProducts).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(draftProducts).map(([name, quantity]) => (
                    <span key={name} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                      {name} × {quantity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">商品を選択してください</p>
              )}
              <p className="mt-2 text-sm font-semibold text-slate-800">
                商品合計：¥{productTotal.toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowProductPicker(true)}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              商品を追加・変更
            </button>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              施術金額
            </label>
            <input
              type="number"
              min="0"
              value={inlinePrice}
              onChange={(event) => setInlinePrice(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveInlineAccounting}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              施術金額を保存
            </button>
          </div>
        </div>

        {showProductPicker && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">商品を追加</h3>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(false)}
                  className="text-2xl text-slate-500 hover:text-slate-900"
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="mb-5 flex flex-wrap gap-2">
                  {productCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveProductCategory(category)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        activeProductCategory === category
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {visibleProducts.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500">
                      該当する商品がありません
                    </p>
                  ) : (
                    visibleProducts.map((item) => {
                      const quantity = draftProducts[item.name] ?? 0;
                      return (
                        <div key={item.id} className="flex w-full items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 py-4 last:border-b-0">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-900">{item.name}</span>
                            <span className="mt-1 block text-sm text-slate-500">¥{Number(item.price || 0).toLocaleString()}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            <button type="button" onClick={() => changeProductQuantity(item.name, -1)} disabled={quantity === 0} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg text-slate-600 disabled:opacity-30" aria-label={`${item.name}を1個減らす`}>−</button>
                            <span className="min-w-5 text-center text-sm font-semibold">{quantity}</span>
                            <button type="button" onClick={() => changeProductQuantity(item.name, 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg text-slate-600" aria-label={`${item.name}を1個増やす`}>+</button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                      選択商品：{Object.values(draftProducts).reduce((sum, quantity) => sum + quantity, 0)}点
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      商品合計：¥{productTotal.toLocaleString()}
                    </span>
                  </div>
                  {Object.keys(draftProducts).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(draftProducts).map(([name, quantity]) => (
                        <span key={name} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700">
                          {name} × {quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={saveSelectedProducts}
                  className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        </div>

      </div>
    </div>
    </div>
  );
}