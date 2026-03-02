/**
 * Product Service
 * Encapsulates all product-related API calls.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { Product, ProductListParams } from "@/types";


export async function fetchProducts(params?: ProductListParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.keyword) {
        queryParams.append('keyword', params.keyword);
    }
    
    if (params?.pageIndex) {
        queryParams.append('pageIndex', params.pageIndex.toString());
    }
    
    if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
    }
    
    const url = `${API_ENDPOINTS.products.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return httpClient.get<Product[]>(url);
}

export async function fetchProductById(id: string) {
    return httpClient.get<Product>(API_ENDPOINTS.products.detail(id));
}
