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
        <div className="border p-4 rounded">
        <h2 className="text-xl font-bold mb-4">
            顧客管理
        </h2>

        <p>登録人数：{customers.length}人</p>
        <input
          type="text"
          placeholder="顧客名・フリガナ・電話番号で検索"
          value={customerSearch}
          onChange={(e) =>
            setCustomerSearch(e.target.value)
          }
          className="w-full border rounded p-2 mt-4 mb-4"
        />
        <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="顧客名"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          placeholder="フリガナ"
          value={customerKana}
          onChange={(e) => setCustomerKana(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          placeholder="電話番号"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full border rounded p-2"
        />

        <textarea
          placeholder="メモ"
          value={customerMemo}
          onChange={(e) => setCustomerMemo(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />

      <button
        onClick={handleAddCustomer}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {editingCustomerId === null
          ? "顧客登録"
          : "保存"}
      </button>
      </div>
      <hr className="my-6" />

<h3 className="text-lg font-bold mb-3">
  顧客一覧
</h3>

  <div className="space-y-3">
    {customers
      .filter((customer) => {
        const keyword =
          customerSearch.toLowerCase();
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
        className="border rounded p-3"
      >
        <div className="font-semibold">
          {customer.name}
        </div>

        <div className="text-sm text-gray-600">
          📞 {customer.phone}
        </div>

        <div className="text-sm">
          来店回数：{customer.visitCount}回
        </div>

        {customer.memo && (
          <div className="mt-2 text-sm">
            メモ：{customer.memo}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setEditingCustomerId(customer.id);

              setCustomerName(customer.name);
              setCustomerKana(customer.kana);
              setCustomerPhone(customer.phone);
              setCustomerMemo(customer.memo);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            編集
          </button>

          <button
            onClick={async() => {
              const hasReservation = reservations.some(
                (reservation) =>
                  reservation.customerId === customer.id
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
                await deleteCustomer(customer.id);

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
                alert("顧客削除に失敗しました。");
                return;
              }
             

              if (
                editingCustomerId === customer.id
              ) {
                setEditingCustomerId(null);
                setCustomerName("");
                setCustomerKana("");
                setCustomerPhone("");
                setCustomerMemo("");
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            削除
          </button>
        </div>
      </div>
    ))}
  </div>
        </div>
    );
}