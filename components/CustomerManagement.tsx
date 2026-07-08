import type { Customer } from "@/types/Customer";

type CustomerManagementProps = {
  customers: Customer[];

  customerName: string;
  setCustomerName: React.Dispatch<
    React.SetStateAction<string>
  >;

  customerPhone: string;
  setCustomerPhone: React.Dispatch<
    React.SetStateAction<string>
  >;

  customerMemo: string;
  setCustomerMemo: React.Dispatch<
    React.SetStateAction<string>
  >;

  setCustomers: React.Dispatch<
    React.SetStateAction<Customer[]>
  >;
};

    export default function CustomerManagement({
    
    
    customers,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerMemo,
    setCustomerMemo,
    setCustomers,
    
    }: CustomerManagementProps){
    const handleAddCustomer = () => {
    if (!customerName || !customerPhone) {
      alert("顧客名と電話番号を入力してください。");
      return;
    }

    setCustomers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: customerName,
        phone: customerPhone,
        visitCount: 1,
        memo: customerMemo,
      },
    ]);

    setCustomerName("");
    setCustomerPhone("");
    setCustomerMemo("");
  };
    return (
        <div className="border p-4 rounded">
        <h2 className="text-xl font-bold mb-4">
            顧客管理
        </h2>

        <p>登録人数：{customers.length}人</p>
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
        顧客登録
      </button>
      </div>
      <hr className="my-6" />

<h3 className="text-lg font-bold mb-3">
  顧客一覧
</h3>

  <div className="space-y-3">
    {customers.map((customer) => (
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
      </div>
    ))}
  </div>
        </div>
    );
}