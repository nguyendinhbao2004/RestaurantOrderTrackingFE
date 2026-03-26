/**
 * Chef Service
 * Encapsulates API calls for the Chef (KDS) dashboard:
 * - Fetching all order items (pending queue)
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

// ==================== TYPES ====================

export interface ChefOrderItem {
  id: string;           // orderItemId
  orderId: string;
  productId: string;
  productName: string;
  note: string;
  status: string;       // numeric string e.g. "2"
  createdAt: string;    // orderAt
  createdBy: string | null;
  createdByName: string | null;
}

// ==================== PAYLOAD TYPES ====================

export interface UpdateOrderItemStatusPayload {
  orderItemIds: string[];
  newStatus: number;
  accountId: string | null;
  changeSource: string;
  assigneeId: string | null;
}

// ==================== API CALLS ====================

export async function getChefOrderItems() {
  const response = await httpClient.get<
    Array<{
      orderItemId: string;
      orderId: string;
      productId: string;
      productName: string;
      note: string;
      status: string;
      orderAt: string;
      createdBy: string | null;
      createdByName: string | null;
    }>
  >(API_ENDPOINTS.orderItems.byAccount);

  // Normalise field names to match ChefOrderItem
  const normalised: ChefOrderItem[] = (response.data ?? []).map((item) => ({
    id: item.orderItemId,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    note: item.note,
    status: item.status,
    createdAt: item.orderAt,
    createdBy: item.createdBy,
    createdByName: item.createdByName,
  }));

  return { ...response, data: normalised };
}

export async function updateOrderItemStatus(
  payload: UpdateOrderItemStatusPayload,
) {
  return httpClient.put<{ succeeded: boolean; message: string; errors: string[] }>(
    API_ENDPOINTS.orderItems.updateStatus,
    payload,
  );
}