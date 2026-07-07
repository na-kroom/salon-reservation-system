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
    return (
        <div className="border p-4 rounded">
        <h2 className="text-xl font-bold mb-4">
            顧客管理
        </h2>

        <p>登録人数：{customers.length}人</p>
        </div>
    );
}