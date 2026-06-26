type Props = {
  isOpen: boolean;
  customer: string;
  setCustomer: React.Dispatch<
    React.SetStateAction<string>
  >;
  startTime: string;

  setStartTime: React.Dispatch<
    React.SetStateAction<string>
  >;
  times: string[];
  lane: string;

  setLane: React.Dispatch<
    React.SetStateAction<string>
  >;
  menu: string;

  setMenu: React.Dispatch<
    React.SetStateAction<string>
  >;
  duration: number;

  setDuration: React.Dispatch<
    React.SetStateAction<number>
  >;
  endTime: string;
  memo: string;

  setMemo: React.Dispatch<
    React.SetStateAction<string>
  >;
  price: string;

  setPrice: React.Dispatch<
    React.SetStateAction<string>
  >;
};

export default function ReservationModal({
  isOpen,
  customer,
  setCustomer,
  startTime,
  setStartTime,
  times,
  lane,
  setLane,
  menu,
  setMenu,
  duration,
  setDuration,
  endTime,
  memo,
  setMemo,
  price,
  setPrice
}: Props) {
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">
            予約登録
          </h2>

          <input
            type="text"
            placeholder="お客様名"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="border p-2 w-full mb-3"
          />

          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 w-full mb-3"
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={duration}
            onChange={(e) =>
              setDuration(Number(e.target.value))
            }
            className="border p-2 w-full mb-4"
          >
            {Array.from(
              { length: 24 },
              (_, i) => (i + 1) * 10
            ).map((minutes) => (
              <option
                key={minutes}
                value={minutes}
              >
                {minutes}分
              </option>
            ))}
          </select>   
          <select>
            {Array.from(
              { length: 24 },
              (_, i) => (i + 1) * 10
            ).map((minutes) => (
              <option
                key={minutes}
                value={minutes}
              >
                {minutes}分
              </option>
            ))}
          </select>
          <div className="mb-4">
            終了予定: {endTime}
          </div>
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="border p-2 w-full mb-4"
          >
            <option value="A">Aレーン</option>
            <option value="B">Bレーン</option>
          </select>

          <select
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            className="border p-2 w-full mb-4"
          >
            <option value="カット">カット</option>
            <option value="カラー">カラー</option>
            <option value="カット＋カラー">
              カット＋カラー
            </option>
            <option value="パーマ">パーマ</option>
          </select>
            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              disabled={
                selectedProductId !== "" &&
                selectedProductId !== "other"
              }
              className="border p-2 w-full mb-4"
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ"
              className="border p-2 w-full mb-4"
            />
          <select
            value={selectedProductId}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedProductId(value);

              if (value === "other") {
                setProduct("");
                return;
              }

              const selected =
                products.find(
                  (p) =>
                    p.id.toString() === value
                );

              if (selected) {
                setProduct(selected.name);
                setPrice(
                  String(selected.price)
                );
              }
            }}
            className="border p-2 w-full mb-2"
          >
            <option value="">
              商品なし
            </option>

            {products.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.name}
              </option>
            ))}

            <option value="other">
              その他
            </option>
          </select>
          {selectedProductId === "other" && (
            <>
              <input
                type="text"
                placeholder="商品名"
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                className="border p-2 w-full mb-2"
              />

              <input
                type="number"
                placeholder="商品価格"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
            </>
          )}

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={() => {
              const newStart =
                timeToMinutes(startTime);

              const newEnd =
                timeToMinutes(
                  calculateEndTime(
                    startTime,
                    duration
                  )
                );

              const exists = reservations.some(
                (r) => {
                  if (
                    r.lane !== lane ||
                    r.date !==
                      date.toISOString().split("T")[0]
                  ) {
                    return false;
                  }

                  const existingStart =
                    timeToMinutes(r.startTime);

                  const existingEnd =
                    timeToMinutes(r.endTime);

                  return (
                    newStart < existingEnd &&
                    newEnd > existingStart
                  );
                }
              );
              if (exists) {
                alert("その時間は既に予約があります");
                return;
              }
              if (!price) {
                alert("料金を入力してください");
                return;
              }


              if (editingId !== null) {
                setReservations(
                  reservations.map((r) =>
                    r.id === editingId
                      ? {
                          ...r,
                          customer,
                          startTime,
                          lane,
                          menu,
                          price: Number(price),
                          memo,
                          product,
                          quantity,
                        }
                      : r
                  )
                );
              } else {
                setReservations([
                  ...reservations,
                   {
                    id: Date.now(),
                    customer,
                    startTime,
                    lane,
                    date: date.toISOString().split("T")[0],
                    menu,
                    endTime: calculateEndTime(
                      startTime,
                      duration
                    ),
                    price: Number(price),
                    memo,
                    product,
                    quantity,
                  }
              ]);
              } 
              setEditingId(null);          
              setCustomer("");
              setStartTime("10:00");
              setLane("A");
              setMemo("");
              setPrice("");
              setIsModalOpen(false);
            }}
            className="bg-black text-white px-4 py-2 rounded mr-2"
          >
            登録
          </button>

          <button
            onClick={() => setIsModalOpen(false)}
            className="border px-3 py-1 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
   
  );
}
