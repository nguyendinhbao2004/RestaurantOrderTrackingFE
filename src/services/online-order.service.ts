import { API_ENDPOINTS } from "@/lib/api-config";
import { getToken } from "@/lib/auth";
import { httpClient } from "@/lib/http-client";

export enum ApiPaymentMethod {
  cash = 1,
  credit_card = 2,
  bank_transfer = 3,
}

export interface OnlineOrderItemRequest {
  productId: string;
  note: string;
  quantity: number;
}

export interface CreateOnlineOrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: ApiPaymentMethod;
  items: OnlineOrderItemRequest[];
}

export interface OnlineOrderData {
  orderId: string;
  billId: string;
  paymentMethod: number;
}

export interface CreatePaymentLinkRequest {
  billId: string;
}

export interface PaymentLinkData {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

export async function createOnlineOrder(payload: CreateOnlineOrderRequest) {
  return httpClient.post<OnlineOrderData>(API_ENDPOINTS.orders.onlineCreate, payload);
}

export async function createPaymentLink(payload: CreatePaymentLinkRequest) {
  const token =
    getToken() ||
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  return httpClient.post<PaymentLinkData>(
    API_ENDPOINTS.payments.createLink,
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
}
