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

export interface PaymentMetadata {
  bin: string;
  accountNumber: string;
  accountName: string;
  description: string;
  qrCode: string;
}

export interface PaymentInfoByOrderData {
  billId: string;
  orderCode: number;
  amount: number;
  status: string;
  paymentMetadata: PaymentMetadata | null;
}

export interface PayBillRequest {
  billId: string;
}

export async function createBill(payload: CreateBillRequest) {
  return httpClient.post<string>(API_ENDPOINTS.cashier.createBill, payload);
}

export async function getPaymentInfoByOrderId(orderId: string) {
  return httpClient.get<PaymentInfoByOrderData>(
    API_ENDPOINTS.payments.paymentInfo(orderId),
  );
}

export async function payBill(payload: PayBillRequest) {
  return httpClient.put<unknown>(API_ENDPOINTS.cashier.payBill, payload);
}
