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
import {
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  UserRound,
  Package,
  ChartNoAxesColumnIncreasing,
  Settings,
  Scissors,
  ChevronDown,
  Store,
  Save,
} from "lucide-react";

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
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen && !isSettingsOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }

      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(target)
      ) {
        setIsSettingsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, isSettingsOpen]);
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
    "home" | "reservation" | "customer" | "product" | "checkout" | "profile"
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
const [customerKeyword, setCustomerKeyword] =
  useState("");
const handleReserveWithCustomer = (selectedCustomer: Customer) => {
  setCustomer(selectedCustomer.name);
  setCustomerId(selectedCustomer.id);
  setDate(new Date());
  setStartTime("10:00");
  setIsModalOpen(true);
};

  return (


  <main className="min-h-screen bg-gray-50">
  {/* ヘッダー */}
  <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-6 px-6">

      {/* ロゴ */}
      <button
        type="button"
        onClick={() => setCurrentPage("home")}
        className="flex shrink-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Scissors size={24} strokeWidth={1.7} />
        </div>

        <div>
          <div className="text-lg font-bold tracking-tight text-slate-800">
            {shopName || "店舗名"}
          </div>
          <div className="mt-0.5 text-[10px] tracking-wide text-slate-500">
            美容室管理システム
          </div>
        </div>
      </button>

      {/* ナビゲーション */}
      <nav className="flex items-center gap-1">
        {[
          {
            id: "home",
            label: "ダッシュボード",
            Icon: LayoutDashboard,
          },
          {
            id: "reservation",
            label: "予約管理",
            Icon: CalendarDays,
          },
          {
            id: "customer",
            label: "顧客管理",
            Icon: UsersRound,
          },
          {
            id: "product",
            label: "商品管理",
            Icon: Package,
          },
          {
            id: "checkout",
            label: "会計",
            Icon: ChartNoAxesColumnIncreasing,
          },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              setCurrentPage(
                id as
                  | "home"
                  | "reservation"
                  | "customer"
                  | "product"
                  | "checkout"
              )
            }
            className={`relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
              currentPage === id
                ? "bg-slate-100/80 text-slate-900 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-slate-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-1">
      {/* ユーザーアイコンとメニュー */}
      <div ref={userMenuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
          aria-label="ユーザーメニュー"
          aria-expanded={isMenuOpen}
        >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound size={20} strokeWidth={1.7} />
        </span>

          <span className="whitespace-nowrap text-sm font-medium text-slate-700">
            {shopName || "店舗名"}
          </span>

          <ChevronDown
            size={15}
            className="text-slate-400"
            strokeWidth={1.8}
          />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setCurrentPage("profile");
                setIsMenuOpen(false);
              }}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              店舗情報
            </button>

            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  "ログアウトしてもよろしいですか？"
                );

                if (confirmed) {
                  handleLogout();
                }
              }}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
      {/* 設定メニュー */}
      <div ref={settingsMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsSettingsOpen((prev) => !prev);
            setIsMenuOpen(false);
          }}
          className={`ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 active:scale-[0.98] ${
            isSettingsOpen
              ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
          aria-label="設定"
          aria-expanded={isSettingsOpen}
          title="設定"
        >
          <Settings size={19} strokeWidth={1.8} />
        </button>

        {isSettingsOpen && (
          <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="px-3 py-2 text-xs font-semibold tracking-wide text-slate-400">
              店舗・アプリ設定
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentPage("profile");
                setIsSettingsOpen(false);
                setIsMenuOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              店舗情報
            </button>

            {[
              "営業時間",
              "定休日",
              "ダークモード",
              "予約設定",
              "表示設定",
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                {label}
              </button>
            ))}

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  "ログアウトしてもよろしいですか？"
                );

                if (confirmed) {
                  handleLogout();
                }

                setIsSettingsOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
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

  {currentPage === "profile" && (
    <div className="mx-auto max-w-3xl">
      {/* ページ見出し */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Store size={23} strokeWidth={1.7} />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            店舗情報
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            店舗の基本情報を管理できます。
          </p>
        </div>
      </div>

      {/* 入力フォーム */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mt-6 space-y-6">
          {/* 店舗名 */}
          <div>
            <label
              htmlFor="shop-name"
              className="block text-sm font-medium text-slate-700"
            >
              店舗名
            </label>

            <input
              id="shop-name"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="店舗名を入力"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label
              htmlFor="shop-phone"
              className="block text-sm font-medium text-slate-700"
            >
              電話番号
            </label>

            <input
              id="shop-phone"
              type="tel"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              placeholder="電話番号を入力"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* 住所 */}
          <div>
            <label
              htmlFor="shop-address"
              className="block text-sm font-medium text-slate-700"
            >
              住所
            </label>

            <input
              id="shop-address"
              type="text"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="住所を入力"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            <Save size={17} strokeWidth={1.8} />
            保存する
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

