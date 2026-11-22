
"use client";

import type { Customer } from "@/types/Customer";
import {
  anonymizeCustomer,
  updateCustomer,
} from "@/utils/customerApi";

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

  const handleAnonymize = async (customer: Customer) => {
    if (customer.name === "削除済み顧客") {
      alert("この顧客はすでに匿名化されています。");
      return;
    }

    const confirmed = window.confirm(
      `${customer.name}さんの個人情報を匿名化します。\n\n` +
      "・顧客名を「削除済み顧客」に変更\n" +
      "・フリガナ、電話番号、顧客メモを削除\n" +
      "・予約履歴に保存された顧客名も変更\n\n" +
      "予約・売上履歴と顧客IDは保持されます。\n" +
      "この操作は元に戻せません。実行しますか？"
    );

    if (!confirmed) return;

    try {
      await anonymizeCustomer(customer.id);

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id
            ? {
                ...item,
                name: "削除済み顧客",
                kana: "",
                phone: "",
                memo: "",
              }
            : item
        )
      );

      alert("顧客の個人情報を匿名化しました。");
    } catch (error) {
      console.error("顧客の匿名化に失敗しました:", error);
      alert("顧客の匿名化に失敗しました。時間をおいて再度お試しください。");
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
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
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

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleRestore(customer)}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                >
                  再表示
                </button>

                <button
                  type="button"
                  onClick={() => handleAnonymize(customer)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  個人情報を匿名化
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
