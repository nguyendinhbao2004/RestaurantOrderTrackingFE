/**
 * Chef Service
 * Encapsulates API calls for the Chef (KDS) dashboard:
 *  - Fetching all order items (pending queue)
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

// ==================== TYPES ====================

export interface ChefOrderItem {
  id: string;
  orderId: string;
  productName: string;
  status: string;
  tableId: string;
  tableNumber: string;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

// ==================== API CALLS ====================

export async function getChefOrderItems(pageIndex: number, pageSize: number) {
  return httpClient.get<ChefOrderItem[]>(
    API_ENDPOINTS.orderItems.list(pageIndex, pageSize),
  );
}
