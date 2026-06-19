"use client";

import React, { useState, useEffect } from "react";

type Reservation = {
  id: number;
  customer: string;
  time: string;
  lane: string;
  date: string;
  menu: string;
  price: number;
  memo: string;
};

export default function Home() {
  type Reservation = {
    id: number;
    time: string;
    lane: string;
    customer: string;
    date: string;
    menu: string;
    price: number;
    memo?: string;
    product: string;
    quantity: number;
  };
  const times = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];


  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      time: "11:00",
      lane: "A",
      customer: "田中",
      date: "2026-06-08",
      menu: "カット",
      price: 5000,
      memo: "",
      product:"",
      quantity:1,
    }

  ]);

useEffect(() => {
  localStorage.setItem(
    "reservations",
    JSON.stringify(reservations)
  );
}, [reservations]);
useEffect(() => {
  try {
    const savedReservations =
      localStorage.getItem("reservations");

    if (savedReservations) {
      setReservations(
        JSON.parse(savedReservations)
      );
    }
  } catch (error) {
    console.error("予約データの読み込み失敗", error);
  }
}, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [customer, setCustomer] = useState("");
  const [time, setTime] = useState("10:00");
  const [lane, setLane] = useState("A");
  const [menu, setMenu] = useState("カット");
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");
  const todaySales = reservations
  .filter(
    (r) =>
      r.date ===
      date.toISOString().split("T")[0]
  )
  .reduce(
    (sum, r) => sum + (r.price || 0),
    0
  );
  const [selectedReservation, setSelectedReservation] =
  useState<any>(null);
  const currentMonth =
  date.getMonth();

const currentYear =
  date.getFullYear();

const monthlySales = reservations
  .filter((r) => {
    const reservationDate =
      new Date(r.date);

    return (
      reservationDate.getMonth() ===
        currentMonth &&
      reservationDate.getFullYear() ===
        currentYear
    );
  })
  .reduce(
    (sum, r) => sum + r.price,
    0
  );
  const [isEditing, setIsEditing] =
  useState(false);
  const [searchTerm, setSearchTerm] =
  useState("");
const [editingId, setEditingId] =
  useState<number | null>(null);
const [product, setProduct] =
  useState("");
const visitCount =
  selectedReservation
    ? reservations.filter(
        (r) =>
          r.customer ===
          selectedReservation.customer
      ).length
    : 0;
const totalSales =
  selectedReservation
    ? reservations
        .filter(
          (r) =>
            r.customer ===
            selectedReservation.customer
        )
        .reduce(
          (sum, r) =>
            sum + r.price,
          0
        )
    : 0;

const [quantity, setQuantity] =
  useState(1);
  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Salon Reservation System
      </h1>

      <div className="mb-6 flex items-center gap-4">
       <button
          className="border px-3 py-1 rounded"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() - 1);
            setDate(newDate);
          }}
        >
          ◀
        </button> 

        <span className="font-semibold">
          {date.toLocaleDateString("ja-JP")}  
        </span>

       <button
          className="border px-3 py-1 rounded"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + 1);
            setDate(newDate);
          }}
        >
          ▶
        </button>
      </div>

      <div className="mb-6">
       <button
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-black px-4 py-2 text-white"
        >
          ＋予約追加
        </button>
        
      
      </div>
      <input
          type="text"
          placeholder="顧客検索"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="border p-2 mb-4"
        />

        <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
        <div className="font-bold">Time</div>
        <div className="font-bold text-center">A Lane</div>
        <div className="font-bold text-center">B Lane</div>

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="border p-2">
              {time}
            </div>
            <div className="border p-2 h-12">
              {reservations
                .filter(
                  (r) =>
                    r.time === time &&
                    r.lane === "A" &&
                    r.date === date.toISOString().split("T")[0]
                    &&
r.customer.includes(searchTerm)
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedReservation(r);
                      setIsEditing(true);
                    }}
                  >
                    {r.customer}
                  </div>
                ))}
            </div>
  
           <div className="border p-2 h-12">
            {reservations
              .filter(
                (r) =>
                  r.time === time &&
                  r.lane === "B" &&
                  r.date === date.toISOString().split("T")[0] &&
                  r.customer.includes(searchTerm)
              )
              .map((r) => (
                <div
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => {
                    if (confirm("削除しますか？")) {
                      setReservations(
                        reservations.filter(
                          (reservation) => reservation !== r
                        )
                      );
                    }
                  }}
                >
                <div>
                    <div>{r.customer}</div>
                    <div className="text-xs text-gray-500">
                      {r.menu}
                    </div>C
                  </div>
                </div>
              ))}
          </div>

          </React.Fragment>
        ))}
      </div>
      {isModalOpen && (
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
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border p-2 w-full mb-3"
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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
              setPrice(e.target.value)}
              placeholder="料金を入力"
              className="border p-2 w-full mb-4"
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ"
              className="border p-2 w-full mb-4"
            />
            <input
            type="text"
            placeholder="購入商品"
            value={product}
            onChange={(e) =>
              setProduct(e.target.value)
            }
            className="border p-2 w-full mb-2"
          />

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
              const exists = reservations.some(
                (r) =>
                  r.time === time &&
                  r.lane === lane &&
                  r.date === date.toISOString().split("T")[0]
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
                          time,
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
                    time,
                    lane,
                    date: date.toISOString().split("T")[0],
                    menu,
                    price: Number(price),
                    memo,
                    product,
                    quantity,
                  },
                ]);
              } 
              setEditingId(null);          
              setCustomer("");
              setTime("10:00");
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
      )}
      {selectedReservation && (
        <div className="mb-4 border p-4">
          <div>
            顧客名:
            {selectedReservation.customer}
          </div>
          <input
            type="text"
            value={selectedReservation.customer}
            onChange={(e) =>
              setSelectedReservation({
                ...selectedReservation,
                customer: e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={() => {
              setReservations(
                reservations.map((r) =>
                  r === selectedReservation
                    ? selectedReservation
                    : r
                )
              );

              setIsEditing(false);
            }}
          >
            保存
          </button>

          <div>
            メニュー:
            {selectedReservation.menu}
          </div>

          <div className="mb-4 text-lg font-bold">
            本日の売上:
            ¥{todaySales.toLocaleString()}
          </div>
          <div className="mb-4 text-lg font-bold">
            今月の売上:
            ¥{monthlySales.toLocaleString()}
          </div>
              <div className="mt-4">
          <h3 className="font-bold">
            顧客履歴
          </h3>
          {reservations
            .filter(
              (r) =>
                r.customer ===
                selectedReservation.customer &&
                r.product
            )
            .map((r) => (
              <div key={r.id}>
                {r.product}
                （{r.quantity}個）
              </div>
          ))}
          <button
            onClick={() => {
              setCustomer(selectedReservation.customer);
              setMenu(selectedReservation.menu);
              setPrice(String(selectedReservation.price));
              setMemo(selectedReservation.memo);

              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            編集
          </button>
  {reservations
    .filter(
      (r) =>
        r.customer ===
        selectedReservation.customer
    )
    .map((r, index) => (
      <div
        key={index}
        className="border-b py-2"
      >
        <div>{r.date}</div>

        <div>{r.menu}</div>

        <div>¥{r.price}</div>
      </div>
    ))}
        </div><div className="mt-4">
          <h3 className="font-bold">
            顧客履歴
          </h3>

          {reservations
            .filter(
              (r) =>
                r.customer ===
                selectedReservation.customer
            )
            .map((r, index) => (
              <div
                key={index}
                className="border-b py-2"
              >
                <div>{r.date}</div>

                <div>{r.menu}</div>

                <div>¥{r.price}</div>
              </div>
            ))}
        </div>
        </div>
      )}
    </main>
  );
}
