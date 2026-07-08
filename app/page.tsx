"use client";


import React, { useState, useEffect } from "react";
import ReservationModal from "@/components/ReservationModal";
import type { Reservation } from "@/types/Reservation";
import type { Product } from "@/types/Product";
import SalesSummary from "@/components/SalesSummary";
import CustomerCard from "@/components/CustomerCard";
import ReservationPage from "@/components/ReservationPage";
import ProductManagement from "@/components/ProductManagement";
import type { Customer } from "@/types/Customer";
import CustomerManagement from "@/components/CustomerManagement";

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      lane: "A",
      customerId: 1,
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
    "18:30",
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

  const [currentPage, setCurrentPage] = useState<
  "reservation" | "customer" | "product"
>("reservation");

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
const handleReservationSubmit = () => {

}
const [editingProductId, setEditingProductId] = useState<number | null>(null);

const [customers, setCustomers] =
useState<Customer[]>([
  {
    id: 1,
    name: "田中",
    phone: "09012345678",
    visitCount: 3,
    memo: "",
  },
]);

const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerMemo, setCustomerMemo] = useState("");

const [quantity, setQuantity] =
  useState(1);
  return (
  
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Salon Reservation System
      </h1>

      <div className="flex gap-2 mb-6">

        <button
          onClick={() => setCurrentPage("reservation")}
          className="border rounded px-4 py-2"
        >
          予約
        </button>

        <button
          onClick={() => setCurrentPage("customer")}
          className="border rounded px-4 py-2"
        >
          顧客管理
        </button>

        <button
          onClick={() => setCurrentPage("product")}
          className="border rounded px-4 py-2"
        >
          商品管理
        </button>
      
      </div>
      {currentPage === "customer" && (
        <CustomerManagement
          customers={customers}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerMemo={customerMemo}
          setCustomerMemo={setCustomerMemo}
          setCustomers={setCustomers}
        />
      )}
      {currentPage === "product" && (
        <>
        <ProductManagement
          products={products}
          productName={productName}
          setProductName={setProductName}
          productPrice={productPrice}
          setProductPrice={setProductPrice}
          setProducts={setProducts}
          editingProductId={editingProductId}
          setEditingProductId={setEditingProductId}
        />
          </>
      )}

    {currentPage === "reservation" && (
    <>
    <ReservationPage
      date={date}
      setDate={setDate}
      setIsModalOpen={setIsModalOpen}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}

      times={times}
      reservations={reservations}
      selectedDate={date.toISOString().split("T")[0]}
      setSelectedReservation={setSelectedReservation}
      setIsEditing={setIsEditing}
    />
    </>
    )}

<ReservationModal
  isOpen={isModalOpen}

  customer={customer}
  setCustomer={setCustomer}
  startTime={startTime}
  setStartTime={setStartTime}
  times={times}
  lane={lane}
  setLane={setLane}
  menu={menu}
  setMenu={setMenu}
  duration={duration}
  setDuration={setDuration}
  endTime={endTime}
  memo={memo}
  setMemo={setMemo}
  price={price}
  setPrice={setPrice}
  onSubmit={handleReservationSubmit}
  products={products}

  selectedProductId={selectedProductId}
  setSelectedProductId={setSelectedProductId}

  product={product}
  setProduct={setProduct}

  quantity={quantity}
  setQuantity={setQuantity}
  customers={customers}
  onClose={() => setIsModalOpen(false)}
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

