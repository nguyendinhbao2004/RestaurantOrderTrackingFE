/**
 * Table Service
 * Encapsulates all table-related API calls.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { ApiTable, AreaApiTable, TableListParams } from "@/types";

export interface QrSessionData {
    tableId: string;
    tableNumber: string;
    sessionToken: string;
    expiresAt: string;
    isActive: boolean;
    qrCodeBase64: string;
}

export async function fetchTables(params?: TableListParams) {
    const queryParams = new URLSearchParams();

    if (params?.pageIndex) {
        queryParams.append('PageIndex', params.pageIndex.toString());
    }

    if (params?.pageSize) {
        queryParams.append('PageSize', params.pageSize.toString());
    }

    const url = `${API_ENDPOINTS.tables.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return httpClient.get<ApiTable[]>(url);
}

export async function fetchTablesByArea(areaId: string) {
    return httpClient.get<AreaApiTable[]>(API_ENDPOINTS.tables.byArea(areaId));
}

export async function generateQrSession(tableId: string) {
    return httpClient.post<QrSessionData>(API_ENDPOINTS.tables.qrSession(tableId));
}

export interface TableBySessionData {
    tableId: string;
    tableNumber: string;
    areaName: string;
    status: string;
    capacity: number;
    sessionToken: string;
    expiresAt: string;
}

export async function fetchTableBySession(session: string) {
    return httpClient.get<TableBySessionData>(API_ENDPOINTS.tables.bySession(session));
}
