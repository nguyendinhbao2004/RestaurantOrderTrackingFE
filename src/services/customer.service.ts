import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export async function fetchCustomerByAccountId(accountId: string) {
  return httpClient.get<CustomerData>(
    API_ENDPOINTS.customers.byAccount(accountId)
  );
}
