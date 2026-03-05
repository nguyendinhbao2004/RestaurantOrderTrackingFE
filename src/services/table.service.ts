/**
 * Table Service
 * Encapsulates all table-related API calls.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { ApiTable, TableListParams } from "@/types";

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
