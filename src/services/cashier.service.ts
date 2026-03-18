/**
 * Cashier Service
 * Encapsulates cashier-related API calls (billing).
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

export interface CreateBillRequest {
  orderId: string;
  cashierAccountId: string;
  paymentMethod: number; // 1=cash, 2=credit_card, 3=bank_transfer
  discount: number;
}

export async function createBill(payload: CreateBillRequest) {
  return httpClient.post<string>(API_ENDPOINTS.cashier.createBill, payload);
}
