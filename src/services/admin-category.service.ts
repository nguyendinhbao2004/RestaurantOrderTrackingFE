/**
 * Admin Category Service
 * Encapsulates all category CRUD calls for admin management.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";

// ==================== TYPES ====================

export interface CategoryData {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    isActive: boolean;
}

export interface CreateCategoryRequest {
    id?: number;
    name: string;
    description: string;
    imageUrl?: string;
}

export interface UpdateCategoryRequest {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    isActive: boolean;
}

// ==================== API CALLS ====================

export async function getCategories() {
    return httpClient.get<CategoryData[]>(API_ENDPOINTS.adminCategories.list);
}

export async function createCategory(data: CreateCategoryRequest) {
    return httpClient.post<number>(API_ENDPOINTS.adminCategories.create, data);
}

export async function updateCategory(data: UpdateCategoryRequest) {
    return httpClient.put<void>(API_ENDPOINTS.adminCategories.update, data);
}

export async function deleteCategory(id: number) {
    return httpClient.delete<void>(API_ENDPOINTS.adminCategories.delete(id));
}
