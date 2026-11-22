"use client";


import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase";
import ReservationModal from "@/components/ReservationModal";
import type { Reservation } from "@/types/Reservation";
import CustomerModal from "@/components/CustomerModal";
import ReservationPage from "@/components/ReservationPage";
import ProductManagement from "@/components/ProductManagement";
import type { Customer } from "@/types/Customer";
import { useCustomers } from "@/hooks/useCustomers";
import CustomerManagement from "@/components/CustomerManagement";
import HiddenCustomersManagement from "@/components/HiddenCustomersManagement";
import { useProducts } from "@/hooks/useProducts";
import {calculateEndTime,} from "@/utils/time";
import {calculateTodaySales,calculateMonthlySales,} from "@/utils/sales";
import {getTotalSales,getLastVisit,} from "@/utils/customer";
import {createReservation as createReservationToSupabase,} from "@/utils/reservationApi";
import HomeDashboard from "@/components/HomeDashboard";
import Checkout from "@/components/Checkout";
import { useReservations } from "@/hooks/useReservations";
import {updateReservation as updateReservationToSupabase,} from "@/utils/reservationApi";
import { isReservationOverlap } from "@/utils/reservationValidation";
import { formatLocalDate } from "@/utils/date";
import { getCurrentShop, getCurrentShopId } from "@/utils/shop";
import {normalizeCustomerName,normalizePhoneNumber,} from "@/utils/customerFormat";
import { createCustomer } from "@/utils/customerApi";
import CustomerAnonymizationManagement from "@/components/CustomerAnonymizationManagement";
export default function Home() {
  useEffect(() => {
  const checkUser = async () => {
  const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
      }
    };

    checkUser();
  }, []);

  const {
    reservations,
    setReservations,
  } = useReservations();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;

      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(target)) {
        setIsShopMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsShopMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  useEffect(() => {
    const loadShop = async () => {
      try {
        const shop = await getCurrentShop();
  

        setShopName(shop.name);
        setShopPhone(shop.phone);
        setShopAddress(shop.address);
      } catch (error) {
        console.error("店舗情報の取得に失敗しました", error);
      }
    };

    loadShop();
  }, []);
  const handleSaveProfile = async () => {
    try {
      const shopId = await getCurrentShopId();

      const { data, error } = await supabase
        .from("shops")
        .update({
          name: shopName,
          phone: shopPhone,
          address: shopAddress,
        })
        .eq("id", shopId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("店舗情報を更新できませんでした");
      }

      alert("店舗情報を保存しました");
    } catch (error) {
      console.error("店舗情報の保存に失敗しました:", error);
      alert("店舗情報の保存に失敗しました。コンソールを確認してください。");
    }
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
    "18:30",
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
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
    ? reservations.filter(
        (r) =>
          r.customer === selectedReservation.customer &&
          r.status === "completed"
      ).length
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
        selectedReservation.customerId
      )
    : "-";

  const {
    products,
    setProducts,
  } = useProducts();
  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "reservation"
    | "customer"
    | "product"
    | "checkout"
    | "profile"
    | "customer-register"
    | "customer-settings"
    | "hidden-customers"
    | "customer-anonymization"
  >("home");
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [customerRegisterReturnPage, setCustomerRegisterReturnPage] =
  useState<"reservation" | "customer-settings">("reservation");
  const [quickCustomerKana, setQuickCustomerKana] = useState("");
  const [quickCustomerPhone, setQuickCustomerPhone] = useState("");
  const [quickCustomerMemo, setQuickCustomerMemo] = useState("");
    const [duration, setDuration] =
      useState(60);

  const endTime =
    calculateEndTime(
      startTime,
      duration
    );



  const handleReservationSubmit = async() => {
    if (!customer || customerId === null) {
      alert("顧客を一覧から選択するか、新規顧客を仮登録してください。");
      return;
    }

    const selectedDate = formatLocalDate(date);
    
    const activeReservations = reservations.filter(
      (r) => r.status !== "cancelled"
    );

    const isDuplicate = isReservationOverlap({
      reservations: activeReservations,
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
const handleReserveWithCustomer = (selectedCustomer: Customer) => {
  setCustomer(selectedCustomer.name);
  setCustomerId(selectedCustomer.id);
  setDate(new Date());
  setStartTime("10:00");
  setIsModalOpen(true);
};

const openQuickCustomerRegistration = () => {
  setCustomerRegisterReturnPage("reservation");
  setQuickCustomerName("");
  setQuickCustomerKana("");
  setQuickCustomerPhone("");
  setQuickCustomerMemo("");
  setIsModalOpen(false);
  setCurrentPage("customer-register");
};

const saveQuickCustomer = async () => {
  const name = normalizeCustomerName(quickCustomerName);
  if (!name) { alert("顧客名を入力してください。"); return; }
  try {
    const created = await createCustomer({
      name,
      kana: normalizeCustomerName(quickCustomerKana),
      phone: normalizePhoneNumber(quickCustomerPhone).trim(),
      memo: quickCustomerMemo.trim(),
      isProvisional: true,
    });
    setCustomers((prev) => [...prev, created]);
    setCustomer(created.name);
    setCustomerId(created.id);
    setCurrentPage("reservation");
    setIsModalOpen(true);
  } catch (error) {
    console.error("仮登録顧客の作成に失敗しました", error);
    alert("仮登録に失敗しました。データベースの設定を確認してください。");
  }
};


  return (


    
<main className="min-h-screen bg-slate-50">
  <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
    <div className="mx-auto flex min-h-[88px] max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
      <button
        type="button"
        onClick={() => setCurrentPage("home")}
        className="flex shrink-0 items-center gap-3 text-left"
        aria-label="ダッシュボードへ"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M8.2 8.2 20 20M8.2 15.8 20 4M14.5 9.5l2-2" />
          </svg>
        </span>
        <span>
          <span className="block text-xl font-bold tracking-tight text-slate-900">{shopName || "○○美容室"}</span>
          <span className="mt-0.5 block text-xs text-slate-500">美容室管理システム</span>
        </span>
      </button>

      <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 lg:gap-2" aria-label="メインナビゲーション">
        {([
          { id: "home", label: "ダッシュボード", icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
          { id: "reservation", label: "予約管理", icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></> },
          { id: "customer", label: "顧客管理", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> },
          { id: "product", label: "商品管理", icon: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></> },
          { id: "checkout", label: "会計", icon: <><path d="M4 20V10M10 20V4M16 20v-7M22 20V7" /></> },
        ] as const).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentPage(item.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition lg:px-4 ${
              currentPage === item.id
                ? "bg-slate-100 font-semibold text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {item.icon}
            </svg>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative" ref={shopMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsShopMenuOpen((prev) => !prev);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            aria-expanded={isShopMenuOpen}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </span>
            <span className="hidden sm:inline">{shopName || "○○美容室"}</span>
            <span className="text-slate-400">⌄</span>
          </button>
          {isShopMenuOpen && (
            <div className="absolute right-0 top-14 z-[60] w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={() => { setCurrentPage("profile"); setIsShopMenuOpen(false); }}
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                店舗情報
              </button>
              <button
                type="button"
                onClick={() => { const confirmed = window.confirm("ログアウトしてもよろしいですか？"); if (confirmed) handleLogout(); }}
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={settingsMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
              setIsShopMenuOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="店舗・アプリ設定"
            aria-expanded={isMenuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.6.78 1 1.41 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-14 z-[60] w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <p className="px-3 pb-2 text-xs font-semibold text-slate-400">店舗・アプリ設定</p>
              <button
                type="button"
                onClick={() => { setCurrentPage("profile"); setIsMenuOpen(false); }}
                className="w-full rounded-lg px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                店舗情報
              </button>
              {["営業時間", "定休日", "ダークモード", "予約設定", "表示設定"].map((label) => (
                <div key={label} className="w-full rounded-lg px-3 py-3 text-sm text-slate-400">
                  {label}
                </div>
              ))}
              <div className="my-2 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm("ログアウトしてもよろしいですか？");
                  if (confirmed) handleLogout();
                }}
                className="w-full rounded-lg px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  <div className="max-w-7xl mx-auto px-8 py-8">
      {currentPage === "customer" && (
        <CustomerManagement
          customers={customers}
          reservations={reservations}
          setCustomers={setCustomers}
          onReserve={handleReserveWithCustomer}
          onOpenCustomerSettings={() => setCurrentPage("customer-settings")}
        />
      )}

      {currentPage === "customer-settings" && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              顧客設定
            </h2>
            <button
              type="button"
              onClick={() => setCurrentPage("customer")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              戻る
            </button>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setCurrentPage("hidden-customers")}
              className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:bg-slate-50"
            >
              <p className="font-medium text-slate-900">
                非表示顧客の管理
              </p>
              <p className="mt-1 text-sm text-slate-500">
                非表示にした顧客の確認と再表示を行います。
              </p>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage("customer-anonymization")}
              className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:bg-slate-50"
            >
              <p className="font-medium text-slate-900">
                顧客データ管理
              </p>
              <p className="mt-1 text-sm text-slate-500">
                長期間来店していない顧客の確認と匿名化候補の管理を行います。
              </p>
            </button>
          </div>
        </div>
      )}
      {currentPage === "hidden-customers" && (
        <HiddenCustomersManagement
          customers={customers}
          setCustomers={setCustomers}
          onBack={() => setCurrentPage("customer-settings")}
        />
      )}
      {currentPage === "customer-anonymization" && (
        <CustomerAnonymizationManagement
          customers={customers}
          reservations={reservations}
          onBack={() => setCurrentPage("customer-settings")}
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
            reservations.filter((r) => r.date === formatLocalDate(new Date())).length
          }
          completedCount={
            reservations.filter(
              (r) => r.date === formatLocalDate(new Date()) && r.status === "completed"
            ).length
          }
          todaySales={calculateTodaySales(reservations, new Date())}
          monthlySales={calculateMonthlySales(reservations, new Date())}
          customerCount={customers.length}
          todayReservations={reservations.filter(
            (r) => r.date === formatLocalDate(new Date())
          )}
          reservations={reservations}
          onOpenReservations={(selectedDate) => {
            setDate(selectedDate);
            setCurrentPage("reservation");
          }}
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
  {currentPage === "customer-register" && (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-slate-900">
      新規顧客の仮登録
    </h2>


  </div>
      <p className="mt-2 text-sm text-slate-500">予約に必要な情報だけで登録できます。フリガナ・電話番号は後から追加できます。</p>
      <div className="mt-6 space-y-4">
        <div><label className="mb-1 block text-sm font-medium text-slate-700">顧客名 *</label><input value={quickCustomerName} onChange={(e) => setQuickCustomerName(e.target.value)} placeholder="例：山田 花子" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></div>
        <div><label className="mb-1 block text-sm font-medium text-slate-700">フリガナ（任意）</label><input value={quickCustomerKana} onChange={(e) => setQuickCustomerKana(e.target.value)} placeholder="例：ヤマダ ハナコ" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></div>
        <div><label className="mb-1 block text-sm font-medium text-slate-700">電話番号（任意）</label><input value={quickCustomerPhone} onChange={(e) => setQuickCustomerPhone(e.target.value)} placeholder="電話番号" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></div>
        <div><label className="mb-1 block text-sm font-medium text-slate-700">メモ（任意）</label><textarea value={quickCustomerMemo} onChange={(e) => setQuickCustomerMemo(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm" /></div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={() => { setCurrentPage("reservation"); setIsModalOpen(true); }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700">戻る</button>
        <button type="button" onClick={saveQuickCustomer} className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white">仮登録して予約に戻る</button>
      </div>
    </div>
  )}

  {currentPage === "profile" && (
    <div className="mx-auto max-w-3xl">

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          店舗情報
        </h3>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              店舗名
            </label>

          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              電話番号
            </label>
          <input
            type="text"
            value={shopPhone}
            onChange={(e) => setShopPhone(e.target.value)}
            placeholder="電話番号を入力"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              住所
            </label>

          
            <input
              type="text"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="住所を入力"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
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
  date={date}
  setDate={setDate}
  customers={customers}
  onClose={() => setIsModalOpen(false)}
  onCreateNewCustomer={openQuickCustomerRegistration}
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

