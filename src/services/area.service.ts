/**
 * Area Service
 * Encapsulates all area-related API calls for admin management.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

// ==================== TYPES ====================

export interface AreaData {
    id: string;
    name: string;
    description: string;
}

export interface CreateAreaRequest {
    name: string;
    description: string;
}

export interface UpdateAreaRequest {
    id: string;
    name: string;
    description: string;
}

// ==================== API CALLS ====================

export async function getAreas() {
    return httpClient.get<AreaData[]>(API_ENDPOINTS.areas.list);
}

export async function createArea(data: CreateAreaRequest) {
    return httpClient.post<string>(API_ENDPOINTS.areas.create, data);
}

export async function updateArea(data: UpdateAreaRequest) {
    return httpClient.put<void>(API_ENDPOINTS.areas.update, data);
}

export async function deleteArea(id: string) {
    return httpClient.delete<void>(API_ENDPOINTS.areas.delete(id));
}
