/**
 * Head Chef Service
 * Encapsulates API calls for the Head Chef dashboard:
 *  - Fetching order items by account (GET /api/OrderItem/by-account)
 *  - Fetching available chefs (GET /api/Chef/available)
 *  - Updating order item status (PUT /api/OrderItem/Update-Status)
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { getToken } from "@/lib/auth";

// ==================== TYPES ====================

export interface OrderItemByAccount {
  orderItemId: string;
  orderId: string;
  productId: string;
  productName: string;
  note: string;
  /** "1" = Pending, "2" = Confirmed/Processing */
  status: string;
  orderAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

export interface AvailableChef {
  accountId: string;
  fullName: string;
  /** "2" = AsiaChef (Món Á), "3" = WesternChef (Món Tây) */
  specialty: string;
  skillLevel: string;
  isAvailable: boolean;
}

export interface UpdateStatusRequest {
  orderItemIds: string[];
  /** Fixed at 2 (Confirmed/assigned) */
  newStatus: number;
  accountId: string;
  changeSource: string;
  assigneeId: string;
}

export interface UpdateStatusResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
}

// ==================== API CALLS ====================

/**
 * Fetch all order items for the current account.
 * GET /api/OrderItem/by-account
 */
export async function getOrderItemsByAccount(): Promise<OrderItemByAccount[]> {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.orderItems.byAccount, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch order items: ${res.status}`);
  }

  const json = await res.json();
  if (json.succeeded === false) {
    throw new Error(json.message || "Failed to fetch order items");
  }

  return Array.isArray(json) ? json : (json.data ?? []);
}

/**
 * /api/Chef/available returns a plain array (no envelope),
 * so we use raw fetch here instead of httpClient.
 */
export async function getAvailableChefs(): Promise<AvailableChef[]> {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.headChef.availableChefs, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch available chefs: ${res.status}`);
  }

  const json = await res.json();
  // API returns a plain array; fall back to .data if envelope ever added
  return Array.isArray(json) ? json : (json.data ?? []);
}

/**
 * Assign a chef to one or more order items.
 * PUT /api/OrderItem/Update-Status
 * newStatus is hardcoded to 2, changeSource is "manual".
 */
export async function updateOrderItemStatus(
  payload: UpdateStatusRequest,
): Promise<UpdateStatusResponse> {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.orderItems.updateStatus, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update order item status: ${res.status}`);
  }

  const json = await res.json();
  return json as UpdateStatusResponse;
}
