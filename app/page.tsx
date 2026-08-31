"use client";


import { useState } from "react";
import ReservationModal from "@/components/ReservationModal";
import type { Reservation } from "@/types/Reservation";
import CustomerModal from "@/components/CustomerModal";
import ReservationPage from "@/components/ReservationPage";
import ProductManagement from "@/components/ProductManagement";
import { useCustomers } from "@/hooks/useCustomers";
import CustomerManagement from "@/components/CustomerManagement";
import { useProducts } from "@/hooks/useProducts";
import {calculateEndTime,} from "@/utils/time";
import {calculateTodaySales,calculateMonthlySales,} from "@/utils/sales";
import {getVisitCount,getTotalSales,getLastVisit,} from "@/utils/customer";
import {createReservation as createReservationToSupabase,} from "@/utils/reservationApi";
import HomeDashboard from "@/components/HomeDashboard";
import Checkout from "@/components/Checkout";
import { useReservations } from "@/hooks/useReservations";
import {updateReservation as updateReservationToSupabase,} from "@/utils/reservationApi";
import { isReservationOverlap } from "@/utils/reservationValidation";
import { formatLocalDate } from "@/utils/date";
export default function Home() {
  const {
    reservations,
    setReservations,
  } = useReservations();

  
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

  const {
    products,
    setProducts,
  } = useProducts();
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



  const handleReservationSubmit = async() => {
    if (!customer) {
      alert("顧客を選択してください");
      return;
    }

    const selectedDate = formatLocalDate(date);

    const isDuplicate = isReservationOverlap({
      reservations,
      date: selectedDate,
      lane,
      startTime,
      endTime,
      excludeReservationId:
        editingId ?? undefined,
    });
  if (isDuplicate) {
    alert("この時間・レーンには既に予約があります。");
    return;
  }
    const reservationData: Omit<Reservation, "id"> = {
    customerId: customerId ?? 0,
    customer,
    lane,
    date: selectedDate,
    startTime,
    endTime,
    menu,
    price: Number(price) || 0,
    memo,
    product,
    status: "reserved",
  };
  if (editingId !== null) {
    try {
      const updatedReservation =
      await updateReservationToSupabase(
        editingId,
        reservationData
      );

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === editingId
            ? updatedReservation
            : reservation
        )
      );
    } catch (error) {
      console.error(
        "予約編集に失敗しました",
        error
      );
      alert("予約編集に失敗しました。");
      return;
    }

    setEditingId(null);
    setCustomerId(null);
    setCustomer("");
    setIsModalOpen(false);

    return;
  }
  try {
    const newReservation =
      await createReservationToSupabase(
      reservationData
      );

    setReservations((prev) => [
      ...prev,
      newReservation,
    ]);

    setIsModalOpen(false);
  } catch (error) {
    console.error(
      "予約登録に失敗しました",
      error
    );
    alert("予約登録に失敗しました。");
    return;
  }
};


const {
  customers,
  setCustomers,
} = useCustomers();

const [customerId, setCustomerId] = useState<number | null>(null);
const [customerKeyword, setCustomerKeyword] =
  useState("");




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
          setCustomers={setCustomers}
        />
      )}
      {currentPage === "product" && (
        <>
        <ProductManagement
          products={products}
          setProducts={setProducts}
        />
          </>
      )}

      {currentPage === "home" && (
        <HomeDashboard
          todayReservationCount={
            reservations.filter(
              (r) => r.date === formatLocalDate(date)
            ).length
          }
          completedCount={
            reservations.filter(
              (r) =>
                r.date === formatLocalDate(date) &&
                r.status === "completed"
            ).length
          }
          todaySales={todaySales}
          monthlySales={monthlySales}
          customerCount={customers.length}
          todayReservations={reservations.filter(
            (r) => r.date === formatLocalDate(date)
          )}
        />
      )}

    {currentPage === "reservation" && (
    <>
    <ReservationPage
      date={date}
      setDate={setDate}
      setIsModalOpen={setIsModalOpen}

      customers={customers}
      times={times}
      reservations={reservations}
      selectedDate={formatLocalDate(date)}
      setSelectedReservation={setSelectedReservation}
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

  customers={customers}
  onClose={() => setIsModalOpen(false)}
/>
<CustomerModal
  isOpen={isCustomerModalOpen}
  onClose={() => setIsCustomerModalOpen(false)}
  selectedReservation={selectedReservation}
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

