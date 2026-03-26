/**
 * Head Chef Service
 * Encapsulates API calls for the Head Chef dashboard:
 *  - Fetching confirmed order items
 *  - Fetching available chefs
 *  - Assigning a chef to an order item
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { getToken } from "@/lib/auth";

// ==================== TYPES ====================

export interface ConfirmedOrderItem {
  orderItemId: string;
  orderId: string;
  tableId: string | null;
  tableNumber: string | null;
  areaId: string | null;
  areaName: string | null;
  productId: string;
  productName: string;
  productPrice: number;
  orderChannel: string;
  note: string;
  status: string;
  createdAt: string;
}

export interface AvailableChef {
  accountId: string;
  fullName: string;
  /** "2" = AsiaChef (Món Á), "3" = WesternChef (Món Tây) */
  specialty: string;
  skillLevel: string;
  isAvailable: boolean;
}

export interface AssignChefRequest {
  orderItemId: string;
  accountId: string;
}

// ==================== API CALLS ====================

export async function getConfirmedOrderItems(
  pageIndex: number,
  pageSize: number,
) {
  return httpClient.get<ConfirmedOrderItem[]>(
    API_ENDPOINTS.orderItems.confirmed(pageIndex, pageSize),
  );
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

export interface AssignChefResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
}

export async function assignChef(payload: AssignChefRequest) {
  return httpClient.post<AssignChefResponse>(
    API_ENDPOINTS.orderItems.assignChef,
    payload,
  );
}
