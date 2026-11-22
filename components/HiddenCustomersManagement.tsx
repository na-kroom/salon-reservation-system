"use client";

import type { Customer } from "@/types/Customer";
import { updateCustomer } from "@/utils/customerApi";

type Props = {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onBack: () => void;
};

export default function HiddenCustomersManagement({
  customers,
  setCustomers,
  onBack,
}: Props) {
  const hiddenCustomers = customers.filter(
    (customer) =>
      customer.isArchived &&
      customer.name !== "削除済み顧客"
  );

  const handleRestore = async (customer: Customer) => {
    const confirmed = window.confirm(
      `${customer.name}さんを再表示しますか？`
    );

    if (!confirmed) return;

    try {
      const updatedCustomer = await updateCustomer(customer.id, {
        name: customer.name,
        kana: customer.kana,
        phone: customer.phone,
        memo: customer.memo,
        isProvisional: customer.isProvisional,
        isArchived: false,
        archivedAt: null,
      });

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id ? updatedCustomer : item
        )
      );

      alert("顧客を再表示しました。");
    } catch (error) {
      console.error("顧客の再表示に失敗しました:", error);
      alert("顧客の再表示に失敗しました。");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            非表示顧客の管理
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            非表示にした顧客を確認・再表示できます。
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          戻る
        </button>
      </div>

      {hiddenCustomers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            非表示の顧客はいません。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hiddenCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {customer.name}
                </p>

                {customer.kana && (
                  <p className="mt-1 text-sm text-slate-500">
                    {customer.kana}
                  </p>
                )}

                {customer.phone && (
                  <p className="mt-1 text-sm text-slate-500">
                    {customer.phone}
                  </p>
                )}

                {customer.archivedAt && (
                  <p className="mt-1 text-xs text-slate-400">
                    非表示日：
                    {new Date(customer.archivedAt).toLocaleDateString("ja-JP")}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRestore(customer)}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                再表示
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}