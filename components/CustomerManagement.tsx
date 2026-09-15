import { useState } from "react";
import type { Customer } from "@/types/Customer";
import type { Reservation } from "@/types/Reservation";
import {createCustomer,updateCustomer,deleteCustomer,} from "@/utils/customerApi";

type CustomerManagementProps = {
  customers: Customer[];
  reservations: Reservation[];


  setCustomers: React.Dispatch<
    React.SetStateAction<Customer[]>
  >;
 
};

    export default function CustomerManagement({
    customers,
    reservations,
    setCustomers,
    }: CustomerManagementProps){
    const [customerName, setCustomerName] = useState("");
    const [customerKana, setCustomerKana] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerMemo, setCustomerMemo] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [editingCustomerId, setEditingCustomerId] =
    useState<number | null>(null);
    const handleAddCustomer = async () => {
      if (
        !customerName ||
        !customerKana ||
        !customerPhone
      ) {
      alert("顧客名・フリガナ・電話番号を入力してください。");
      return;
    }
    if (editingCustomerId !== null) {
    try {
      const updatedCustomer = await updateCustomer(
        editingCustomerId,
        {
          name: customerName,
          kana: customerKana,
          phone: customerPhone,
          memo: customerMemo,
        }
      );

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editingCustomerId
            ? updatedCustomer
            : customer
        )
      );
    } catch (error) {
      console.error(
        "顧客編集に失敗しました",
        error
      );
      alert("顧客編集に失敗しました。");
      return;
    }

    setEditingCustomerId(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerMemo("");

    return;
  }

  try {
    const newCustomer = await createCustomer({
      name: customerName,
      kana: customerKana,
      phone: customerPhone,
      memo: customerMemo,
    });

    setCustomers((prev) => [
      ...prev,
      newCustomer,
    ]);
  } catch (error) {
    console.error(
      "顧客登録に失敗しました",
      error
    );
    alert("顧客登録に失敗しました。");
    return;
  }

    setCustomerName("");
    setCustomerKana("");
    setCustomerPhone("");
    setCustomerMemo("");
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* 顧客登録 */}
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        顧客登録
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        顧客情報を登録・編集できます
      </p>

      <div className="mt-6 space-y-3">
        <input
          type="text"
          placeholder="顧客名"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          placeholder="フリガナ"
          value={customerKana}
          onChange={(e) => setCustomerKana(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          placeholder="電話番号"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <textarea
          placeholder="メモ"
          value={customerMemo}
          onChange={(e) => setCustomerMemo(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <button
          onClick={handleAddCustomer}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          {editingCustomerId === null ? "顧客登録" : "保存"}
        </button>
      </div>

      <hr className="my-8 border-slate-200" />

      {/* 顧客検索 */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          顧客検索
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          顧客名・フリガナ・電話番号から検索できます
        </p>

        <input
          type="text"
          placeholder="顧客名・フリガナ・電話番号で検索"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* 検索結果 */}
      {customerSearch.trim() !== "" && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            検索結果
          </h3>

          <div className="mt-4 space-y-3">
            {customers
              .filter((customer) => {
                const keyword = customerSearch
                  .toLowerCase()
                  .trim();

                return (
                  customer.name
                    .toLowerCase()
                    .includes(keyword) ||
                  customer.kana
                    .toLowerCase()
                    .includes(keyword) ||
                  customer.phone.includes(customerSearch)
                );
              })
              .map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        {customer.name}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {customer.kana}
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        📞 {customer.phone}
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        来店回数：{customer.visitCount}回
                      </div>

                      {customer.memo && (
                        <div className="mt-2 text-sm text-slate-600">
                          メモ：{customer.memo}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => {
                          setEditingCustomerId(customer.id);
                          setCustomerName(customer.name);
                          setCustomerKana(customer.kana);
                          setCustomerPhone(customer.phone);
                          setCustomerMemo(customer.memo);
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        編集
                      </button>

                      <button
                        onClick={async () => {
                          const hasReservation =
                            reservations.some(
                              (reservation) =>
                                reservation.customerId ===
                                customer.id
                            );

                          if (hasReservation) {
                            alert(
                              "予約履歴があるため削除できません。"
                            );
                            return;
                          }

                          if (
                            !confirm(
                              `${customer.name}さんを削除しますか？`
                            )
                          ) {
                            return;
                          }

                          try {
                            await deleteCustomer(
                              customer.id
                            );

                            setCustomers((prev) =>
                              prev.filter(
                                (c) => c.id !== customer.id
                              )
                            );
                          } catch (error) {
                            console.error(
                              "顧客削除に失敗しました",
                              error
                            );
                            alert(
                              "顧客削除に失敗しました。"
                            );
                            return;
                          }

                          if (
                            editingCustomerId ===
                            customer.id
                          ) {
                            setEditingCustomerId(null);
                            setCustomerName("");
                            setCustomerKana("");
                            setCustomerPhone("");
                            setCustomerMemo("");
                          }
                        }}
                        className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {customers.filter((customer) => {
              const keyword = customerSearch
                .toLowerCase()
                .trim();

              return (
                customer.name
                  .toLowerCase()
                  .includes(keyword) ||
                customer.kana
                  .toLowerCase()
                  .includes(keyword) ||
                customer.phone.includes(customerSearch)
              );
            }).length === 0 && (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                該当する顧客が見つかりません
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}