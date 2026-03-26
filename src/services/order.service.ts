import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

export enum ApiOrderType {
  DineIn = 0,
  TakeAway = 1,
}

export interface CreateOrderRequest {
  tableId: string;
  accountId: string | null;
  orderType: ApiOrderType;
}

export interface CreateOrderItemLine {
  productId: string;
  note: string;
  quantity: number;
}

export interface CreateOrderItemsRequest {
  orderId: string;
  orderChannel: string;
  createdBy: string | null;
  items: CreateOrderItemLine[];
}

export interface UpdateOrderStatusRequest {
  id: string;
  newStatus: number;
}

export type CreateOrderResponseData = string | null;

export function resolveOrderId(orderData: CreateOrderResponseData): string | null {
  if (typeof orderData === "string" && orderData.trim()) return orderData;
  return null;
}

export async function createOrder(payload: CreateOrderRequest) {
  return httpClient.post<CreateOrderResponseData>(API_ENDPOINTS.orders.create, payload);
}

export async function createOrderItems(payload: CreateOrderItemsRequest) {
  return httpClient.post<unknown>(API_ENDPOINTS.orders.createItem, payload);
}

export async function updateOrderStatus(payload: UpdateOrderStatusRequest) {
  return httpClient.put<string>(API_ENDPOINTS.orders.updateStatus, payload);
}
