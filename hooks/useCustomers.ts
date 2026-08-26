import { useEffect, useState } from "react";
import type { Customer } from "@/types/Customer";
import { fetchCustomers } from "@/utils/customerApi";

export function useCustomers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await fetchCustomers();

        console.log(
          "Supabaseから取得した顧客:",
          data
        );

        if (data) {
          setCustomers(data);
        }
      } catch (error) {
        console.error(
          "顧客データ取得失敗",
          error
        );
      }
    }

    loadCustomers();
  }, []);

  return {
    customers,
    setCustomers,
  };
}