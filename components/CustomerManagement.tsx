import { useState } from "react";
import type { Customer } from "@/types/Customer";
import type { Reservation } from "@/types/Reservation";
import {createCustomer,updateCustomer,deleteCustomer,} from "@/utils/customerApi";
import {normalizeCustomerName,normalizePhoneNumber,} from "@/utils/customerFormat";
const kanaGroups: Record<string, string[]> = {
  あ: ["ア", "イ", "ウ", "エ", "オ"],
  か: ["カ", "キ", "ク", "ケ", "コ", "ガ", "ギ", "グ", "ゲ", "ゴ"],
  さ: ["サ", "シ", "ス", "セ", "ソ", "ザ", "ジ", "ズ", "ゼ", "ゾ"],
  た: ["タ", "チ", "ツ", "テ", "ト", "ダ", "ヂ", "ヅ", "デ", "ド"],
  な: ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  は: [
    "ハ", "ヒ", "フ", "ヘ", "ホ",
    "バ", "ビ", "ブ", "ベ", "ボ",
    "パ", "ピ", "プ", "ペ", "ポ",
  ],
  ま: ["マ", "ミ", "ム", "メ", "モ"],
  や: ["ヤ", "ユ", "ヨ"],
  ら: ["ラ", "リ", "ル", "レ", "ロ"],
  わ: ["ワ", "ヲ", "ン"],
};

const getKanaGroup = (kana: string): string => {
  const normalized = normalizeCustomerName(kana)
    .replace(/[\u30A1-\u30F6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    )
    .replace(/[\s　]/g, "");

  const firstChar = normalized.charAt(0);

  for (const [group, chars] of Object.entries(kanaGroups)) {
    const normalizedChars = chars.map((char) =>
      char.replace(/[\u30A1-\u30F6]/g, (c) =>
        String.fromCharCode(c.charCodeAt(0) - 0x60)
      )
    );

    if (normalizedChars.includes(firstChar)) {
      return group;
    }
  }

  return "他";
};
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
    const getCustomerVisitCount = (customerId: number) => {
      return reservations.filter(
        (reservation) =>
          reservation.customerId === customerId &&
          reservation.status === "completed"
      ).length;
    };
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [selectedKanaGroup, setSelectedKanaGroup] = useState("すべて");
    const [editingCustomerId, setEditingCustomerId] =
    useState<number | null>(null);
    const filteredCustomers = customers
      .filter((customer) => {
        const keyword = normalizeCustomerName(customerSearch)
          .toLowerCase();

        const name = normalizeCustomerName(customer.name)
          .toLowerCase();

        const kana = normalizeCustomerName(customer.kana)
          .toLowerCase();

        const phone = normalizePhoneNumber(customer.phone);
        const normalizedPhoneKeyword = normalizePhoneNumber(
          customerSearch
        ).trim();

        const matchesSearch =
          keyword === "" ||
          name.includes(keyword) ||
          kana.includes(keyword) ||
          phone.includes(normalizedPhoneKeyword);

        const matchesKanaGroup =
          selectedKanaGroup === "すべて" ||
          getKanaGroup(customer.kana) === selectedKanaGroup;

        return matchesSearch && matchesKanaGroup;
      })
      .sort((a, b) =>
        a.kana.localeCompare(b.kana, "ja")
      );
    const handleAddCustomer = async () => {
      const normalizedName = normalizeCustomerName(customerName);
      const normalizedKana = normalizeCustomerName(customerKana);
      const normalizedPhone = normalizePhoneNumber(customerPhone);

      if (
        !normalizedName ||
        !normalizedKana ||
        !normalizedPhone.trim()
      ) {
        alert("顧客名・フリガナ・電話番号を入力してください。");
        return;
      }
    if (editingCustomerId !== null) {
    try {
        const updatedCustomer = await updateCustomer(
          editingCustomerId,
          {
            name: normalizedName,
            kana: normalizedKana,
            phone: normalizedPhone.trim(),
            memo: customerMemo.trim(),
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
    setCustomerKana("");
    setCustomerPhone("");
    setCustomerMemo("");

    return;
  }

  try {
    const newCustomer = await createCustomer({
      name: normalizedName,
      kana: normalizedKana,
      phone: normalizedPhone.trim(),
      memo: customerMemo.trim(),
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
        <button
          type="button"
          onClick={() => setShowCustomerList((prev) => !prev)}
          className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          {showCustomerList ? "顧客一覧を閉じる" : "顧客一覧"}
        </button>
        <div className="mt-4 flex flex-wrap gap-2">
          {["すべて", ...Object.keys(kanaGroups), "他"].map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => {
                setSelectedKanaGroup(group);
                setShowCustomerList(true);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                selectedKanaGroup === group
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {group}
            </button>
          ))}
</div>
      </div>

      {/* 検索結果 */}
      {(customerSearch.trim() !== "" || showCustomerList) && (
        <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">
          {customerSearch.trim() !== "" ? "検索結果" : "顧客一覧"}
        </h3>

          <div className="mt-4 space-y-3">
            {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        {normalizeCustomerName(customer.name)}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {normalizeCustomerName(customer.kana)}
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        📞 {normalizePhoneNumber(customer.phone)}
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        来店回数：{getCustomerVisitCount(customer.id)}回
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
                              `${normalizeCustomerName(customer.name)}さんを削除しますか？`
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

              {filteredCustomers.length === 0 && (
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