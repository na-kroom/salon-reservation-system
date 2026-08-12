"use client";


import React, { useState, useEffect } from "react";
import ReservationModal from "@/components/ReservationModal";
import type { Reservation } from "@/types/Reservation";
import type { Product } from "@/types/Product";
import SalesSummary from "@/components/SalesSummary";
import CustomerCard from "@/components/CustomerCard";
import CustomerModal from "@/components/CustomerModal";
import ReservationPage from "@/components/ReservationPage";
import ProductManagement from "@/components/ProductManagement";
import type { Customer } from "@/types/Customer";
import CustomerManagement from "@/components/CustomerManagement";
import {calculateEndTime,timeToMinutes,} from "@/utils/time";
import {calculateTodaySales,calculateMonthlySales,} from "@/utils/sales";
import {getVisitCount,getTotalSales,getLastVisit,} from "@/utils/customer";
import {saveReservations,loadReservations,} from "@/utils/storage";
import {createReservation,updateReservation,} from "@/utils/reservation";
import { fetchCustomers } from "@/utils/customerApi";
import { fetchProducts } from "@/utils/productApi";
import HomeDashboard from "@/components/HomeDashboard";
import Checkout from "@/components/Checkout";


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
      status: "reserved",
      
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
  saveReservations(reservations);
}, [reservations]);
useEffect(() => {
  try {
    const savedReservations =
      loadReservations();

    if (savedReservations) {
      setReservations(savedReservations);
    }
  } catch (error) {
    console.error(
      "予約データの読み込み失敗",
      error
    );
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
  const todaySales =
    calculateTodaySales(
      reservations,
      date
    );
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] =
    useState(false);
  const monthlySales =
    calculateMonthlySales(
      reservations,
      date
    );

  const [isEditing, setIsEditing] =
  useState(false);
  const [searchTerm, setSearchTerm] =
  useState("");
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [product, setProduct] =
    useState("");
  const visitCount = selectedReservation
    ? getVisitCount(
        reservations,
        selectedReservation.customer
      )
    : 0;
  const [productName, setProductName] =
    useState("");

  const [productPrice, setProductPrice] =
    useState("");

    const totalSales = selectedReservation
  ? getTotalSales(
      reservations,
      selectedReservation.customer
    )
  : 0;

  const lastVisit = selectedReservation
  ? getLastVisit(
      reservations,
      selectedReservation.customer
    )
  : "-";

  const customerCount = selectedReservation
    ? reservations.filter(
        (r) =>
          r.customer ===
          selectedReservation.customer
      ).length
    : 0;
  const [products, setProducts] =
  useState<Product[]>([]);
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "商品データ取得失敗",
          error
        );
      }
    }

    loadProducts();
  }, []);

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [currentPage, setCurrentPage] = useState<
    "home" | "reservation" | "customer" | "product" | "checkout"
  >("home");

  const [duration, setDuration] =
    useState(60);

  const endTime =
    calculateEndTime(
      startTime,
      duration
    );



  const handleReservationSubmit = () => {
    if (!customer) {
      alert("顧客を選択してください");
      return;
    }


  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  const isDuplicate = reservations.some((reservation) => {
    if (
      reservation.date !== date.toISOString().split("T")[0] ||
      reservation.lane !== lane
    ) {
      return false;
    }

    const reservationStart = timeToMinutes(
      reservation.startTime
    );

    const reservationEnd = timeToMinutes(
      reservation.endTime
    );

    return (
      newStart < reservationEnd &&
      newEnd > reservationStart
    );
  }); 

  if (isDuplicate) {
    alert("この時間・レーンには既に予約があります。");
    return;
  }
  if (editingId !== null) {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === editingId
          ? updateReservation(reservation, {
              customerId: customerId ?? reservation.customerId,
              customer,
              lane,
              date: date.toISOString().split("T")[0],
              startTime,
              endTime,
              menu,
              price: Number(price) || 0,
              memo,
              product,
              quantity,
            })
          : reservation
      )
    );

    setEditingId(null);
    setCustomerKeyword("");
    setCustomerId(null);
    setCustomer("");
    setIsModalOpen(false);

    return;
  }
  const newReservation = createReservation({
    customerId: customerId ?? 0,
    customer,

    lane,
    date: date.toISOString().split("T")[0],

    startTime,
    endTime,

    menu,

    price: Number(price) || 0,

    memo,

    product,

    quantity,

    status: "reserved",
  });
  setReservations((prev) => [
    ...prev,
    newReservation,
  ]);

  setIsModalOpen(false);
};

const [editingProductId, setEditingProductId] = useState<number | null>(null);

const [customers, setCustomers] =
  useState<Customer[]>([]);

const [customerId, setCustomerId] = useState<number | null>(null);
const [customerKeyword, setCustomerKeyword] =
  useState("");
const [customerName, setCustomerName] = useState("");
const [customerKana, setCustomerKana] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerMemo, setCustomerMemo] = useState("");
const [customerSearch, setCustomerSearch] =
  useState("");
const [editingCustomerId, setEditingCustomerId] =
  useState<number | null>(null);

const [quantity, setQuantity] =
  useState(1);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await fetchCustomers();

        console.log("Supabaseから取得した顧客:", data);

        if (data) {
          setCustomers(data);
        }
      } catch (error) {
        console.error(
          "顧客データ取得失敗",
          error
        );
      }
    }

    loadCustomers();
  }, [])
  return (


    
<main className="min-h-screen bg-gray-50">
  <div className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200">
    <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-8">
      <h1 className="mb-8 text-4xl font-bold text-gray-800">
        Salon Manager
      </h1>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentPage("home")}
          className={`rounded-lg px-5 py-2 transition ${
            currentPage === "home"
              ? "bg-slate-800 text-white border border-slate-800"
              : "border border-gray-300 bg-white hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          ホーム
        </button>

        <button
          onClick={() => setCurrentPage("reservation")}
          className={`rounded-lg px-5 py-2 transition ${
            currentPage === "reservation"
              ? "bg-slate-800 text-white border border-slate-800"
              : "border border-gray-300 bg-white hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          予約
        </button>

        <button
          onClick={() => setCurrentPage("customer")}
          className={`rounded-lg px-5 py-2 transition ${
            currentPage === "customer"
              ? "bg-slate-800 text-white border border-slate-800"
              : "border border-gray-300 bg-white hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          顧客管理
        </button>

        <button
          onClick={() => setCurrentPage("product")}
          className={`rounded-lg px-5 py-2 transition ${
            currentPage === "product"
              ? "bg-slate-800 text-white border border-slate-800"
              : "border border-gray-300 bg-white hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          商品管理
        </button>

        <button
          onClick={() => setCurrentPage("checkout")}
          className={`rounded-lg px-5 py-2 transition ${
            currentPage === "checkout"
              ? "bg-slate-800 text-white border border-slate-800"
              : "border border-gray-300 bg-white hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          会計
        </button>
      </div>
    </div>
  </div>
  <div className="max-w-7xl mx-auto px-8 py-8">
      {currentPage === "customer" && (
        <CustomerManagement
          customers={customers}
          reservations={reservations}
          customerName={customerName}
          customerKana={customerKana}
          setCustomerKana={setCustomerKana}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerMemo={customerMemo}
          setCustomerMemo={setCustomerMemo}
          setCustomers={setCustomers}
          editingCustomerId={editingCustomerId}
          setEditingCustomerId={setEditingCustomerId}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
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

      {currentPage === "home" && (
        <HomeDashboard
          todayReservationCount={
            reservations.filter(
              (r) => r.date === date.toISOString().split("T")[0]
            ).length
          }
          completedCount={
            reservations.filter(
              (r) =>
                r.date === date.toISOString().split("T")[0] &&
                r.status === "completed"
            ).length
          }
          todaySales={todaySales}
          monthlySales={monthlySales}
          customerCount={customers.length}
          todayReservations={reservations.filter(
            (r) => r.date === date.toISOString().split("T")[0]
          )}
        />
      )}

    {currentPage === "reservation" && (
    <>
    <ReservationPage
      date={date}
      setDate={setDate}
      setIsModalOpen={setIsModalOpen}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      customers={customers}
      times={times}
      reservations={reservations}
      selectedDate={date.toISOString().split("T")[0]}
      setSelectedReservation={setSelectedReservation}
      setIsEditing={setIsEditing}
      setIsCustomerModalOpen={setIsCustomerModalOpen}
    />
    </>
    )}

  {currentPage === "checkout" && (
    <Checkout
      reservations={reservations}
      setReservations={setReservations}
      products={products}
    />
  )}

<ReservationModal
  isOpen={isModalOpen}

  customer={customer}
  setCustomer={setCustomer}
  customerKeyword={customerKeyword}
  setCustomerKeyword={setCustomerKeyword}
  customerId={customerId}
  setCustomerId={setCustomerId}
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
<CustomerModal
  isOpen={isCustomerModalOpen}
  onClose={() => setIsCustomerModalOpen(false)}
  selectedReservation={selectedReservation}
  setIsEditing={setIsEditing}
  setSelectedReservation={setSelectedReservation}
  visitCount={visitCount}
  totalSales={totalSales}
  lastVisit={lastVisit}

  setEditingId={setEditingId}
  setCustomerId={setCustomerId}
  setCustomer={setCustomer}
  setMenu={setMenu}
  setPrice={setPrice}
  setMemo={setMemo}
  setIsModalOpen={setIsModalOpen}
  setReservations={setReservations}
  reservations={reservations}
/>
    </div>
   </main>

);
}

