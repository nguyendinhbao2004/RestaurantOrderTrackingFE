/**
 * Admin Product Service
 * Encapsulates paginated product list, create, update, and status toggle.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { Pagination } from "@/lib/http-client";

// ==================== TYPES ====================

export interface AdminProductData {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    categoryName: string;
    isActive: string | boolean;
}

export interface AdminProductListParams {
    keyword?: string;
    pageIndex?: number;
    pageSize?: number;
}

export interface AdminProductsApiResponse {
    succeeded: boolean;
    message: string;
    data: AdminProductData[];
    meta: {
        pagination: Pagination;
    };
    errors: string[];
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    categoryId: number;
}

export interface UpdateProductInfoRequest {
    id: string;
    name: string;
    price: number;
    description: string;
}

// ==================== API CALLS ====================

export async function getAdminProducts(params?: AdminProductListParams): Promise<AdminProductsApiResponse> {
    const query = new URLSearchParams();
    if (params?.keyword) query.append("keyword", params.keyword);
    if (params?.pageIndex) query.append("pageIndex", params.pageIndex.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    const url = `${API_ENDPOINTS.adminProducts.list}${query.toString() ? `?${query}` : ""}`;
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

export async function createProduct(data: CreateProductRequest) {
    return httpClient.post<string>(API_ENDPOINTS.adminProducts.create, data);
}

export async function updateProductInfo(data: UpdateProductInfoRequest) {
    return httpClient.put<string>(API_ENDPOINTS.adminProducts.updateInfo, data);
}

export async function toggleProductStatus(id: string) {
    return httpClient.put<string>(API_ENDPOINTS.adminProducts.updateStatus(id));
}
