"use client";


import React, { useState, useEffect } from "react";
import ReservationModal from "@/components/ReservationModal";
import type { Reservation } from "@/types/Reservation";
import type { Product } from "@/types/Product";
import SalesSummary from "@/components/SalesSummary";
import CustomerCard from "@/components/CustomerCard";

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      lane: "A",
      customer: "田中",
      date: "2026-06-08",
      startTime:"11:00",
      endTime:"12:00",
      menu: "カット",
      price: 5000,
      memo: "",
      product: "",
      quantity: 1,
    }
  ]);

  
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
  const [startTime, setStartTime] = useState("10:00");
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
  useState<Reservation | null>(null);

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
const [productName, setProductName] =
  useState("");

const [productPrice, setProductPrice] =
  useState("");

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
const lastVisit =
  selectedReservation
    ? reservations
        .filter(
          (r) =>
            r.customer ===
            selectedReservation.customer
        )
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )[0]?.date ?? "-"
: "-";

const customerCount = selectedReservation
  ? reservations.filter(
      (r) =>
        r.customer ===
        selectedReservation.customer
    ).length
  : 0;

const [products, setProducts] =
  useState<Product[]>([
    {
      id: 1,
      name: "N.オイル",
      price: 3200,
    },
  ]);
const [selectedProductId, setSelectedProductId] =
  useState("");

const [duration, setDuration] =
  useState(60);
const calculateEndTime = (
  startTime: string,
  duration: number
) => {
  const [hour, minute] =
    startTime.split(":").map(Number);

  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute + duration);

  return date.toLocaleTimeString(
    "ja-JP",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
};
const endTime =
  calculateEndTime(
    startTime,
    duration
  );

const timeToMinutes = (
  time: string
) => {
  const [hour, minute] =
    time.split(":").map(Number);

  return hour * 60 + minute;
};

const [quantity, setQuantity] =
  useState(1);
  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Salon Reservation System
      </h1>
      <div className="mb-6 border p-4">
        <h2 className="font-bold text-lg mb-2">
        <div className="mb-4">
        <input
          type="text"
          placeholder="商品名"
          value={productName}
          onChange={(e) =>
            setProductName(e.target.value)
          }
          className="border p-2 mr-2"
        />

        <input
          type="number"
          placeholder="価格"
          value={productPrice}
          onChange={(e) =>
            setProductPrice(e.target.value)
          }
          className="border p-2 mr-2"
        />

        <button
          onClick={() => {
            if (!productName || !productPrice) {
              alert("商品名と価格を入力してください");
              return;
            }

            setProducts([
              ...products,
              {
                id: Date.now(),
                name: productName,
                price: Number(productPrice),
              },
            ]);

            setProductName("");
            setProductPrice("");
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          商品追加
        </button>
      </div>
          商品一覧
        </h2>

        {products.map((product) => (
          <div
            key={product.id}
            className="border-b py-2 flex justify-between"
          >
            <span>
              {product.name}
              （¥{product.price.toLocaleString()}）
            </span>

            <button
              onClick={() => {
                if (
                  confirm(
                    `${product.name}を削除しますか？`
                  )
                ) {
                  setProducts(
                    products.filter(
                      (p) => p.id !== product.id
                    )
                  );
                }
              }}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              削除
            </button>
          </div>
        ))}
      </div>
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
                    r.startTime === time &&
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
                  r.startTime === time &&
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
                                      <div className="text-xs">
                      {r.startTime}〜{r.endTime}
                    </div>
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
<ReservationModal
  isOpen={isModalOpen}

  customer={customer}
  setCustomer={setCustomer}
  startTime={startTime}
  setStartTime={setStartTime}
  times={times}
/>

      
<CustomerCard
  selectedReservation={selectedReservation}
/>
{selectedReservation && (
  <div className="mb-4 border p-4">
    <div>
      顧客名:
      {selectedReservation.customer}
    </div>
    <div>
      来店回数:
      {visitCount}回
    </div>
    <div>
      累計売上:
      ¥{totalSales.toLocaleString()}
    </div>
    <div>
      前回来店日:
      {lastVisit}
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
            r.id === selectedReservation.id
              ? selectedReservation
              : r
          )
        );

        setIsEditing(false);
      }}
      className="bg-green-500 text-white px-4 py-2 rounded mb-2"
    >
      保存
    </button>

    <div>
      メニュー:
      {selectedReservation.menu}
    </div>

    <SalesSummary
      todaySales={todaySales}
      monthlySales={monthlySales}
    />

    <div className="mt-4">
      <h3 className="font-bold">
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
          <div key={r.id}>
            {r.product}
            （{r.quantity}個）
          </div>
        ))}
    </div>

    <button
      onClick={() => {
        setEditingId(selectedReservation.id);

        setCustomer(selectedReservation.customer);
        setMenu(selectedReservation.menu);
        setPrice(
          String(selectedReservation.price)
        );
        setMemo(selectedReservation.memo);

        setIsModalOpen(true);
      }}
      className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
    >
      編集
    </button>

    <div className="mt-4">
      <h3 className="font-bold">
        顧客履歴
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
)}
   </main>
);
}
