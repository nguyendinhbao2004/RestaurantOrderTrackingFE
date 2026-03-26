/**
 * Dashboard Service
 * Fetches summary statistics for the admin dashboard.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

// ==================== TYPES ====================

export interface DashboardSummary {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    pendingOrders: number;
}

// ==================== API CALLS ====================

export async function getDashboardSummary() {
    return httpClient.get<DashboardSummary>(API_ENDPOINTS.dashboard.summary);
}
