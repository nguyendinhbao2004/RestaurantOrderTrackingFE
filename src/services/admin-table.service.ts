/**
 * Admin Table Service
 * Encapsulates paginated table list, create, update-info, and update-status.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { Pagination } from "@/lib/http-client";

// ==================== TYPES ====================

export interface AdminTableData {
    id: string;
    tableNumber: string;
    areaName: string;
    status: string;
    capacity: number;
}

export interface AdminTableListParams {
    keyword?: string;
    pageIndex?: number;
    pageSize?: number;
}

export interface AdminTablesApiResponse {
    succeeded: boolean;
    message: string;
    data: AdminTableData[];
    meta: {
        pagination: Pagination;
    };
    errors: string[];
}

export interface CreateTableRequest {
    tableNumber: string;
    areaId: string;
    qrCode?: string | null;
    capacity?: number;
}

export interface UpdateTableInfoRequest {
    id: string;
    areaId: string;
    tableNumber: string;
    capacity: number;
}

export interface UpdateTableStatusRequest {
    id: string;
    status: string;
}

// ==================== API CALLS ====================

export async function getAdminTables(params?: AdminTableListParams): Promise<AdminTablesApiResponse> {
    const query = new URLSearchParams();
    if (params?.keyword) query.append("keyword", params.keyword);
    if (params?.pageIndex) query.append("pageIndex", params.pageIndex.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    const url = `${API_ENDPOINTS.tables.list}${query.toString() ? `?${query}` : ""}`;
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(typeof window !== "undefined" && localStorage.getItem("token")
                ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                : {}),
        },
    });
    return response.json();
}

export async function createTable(data: CreateTableRequest) {
    return httpClient.post<string>(API_ENDPOINTS.tables.create, data);
}

export async function updateTableInfo(data: UpdateTableInfoRequest) {
    return httpClient.put<string>(API_ENDPOINTS.tables.updateInfo, data);
}

export async function updateTableStatus(data: UpdateTableStatusRequest) {
    return httpClient.put<string>(API_ENDPOINTS.tables.updateStatus, data);
}
