/**
 * Category Service
 * Encapsulates all category-related API calls.
 */

import { API_ENDPOINTS } from "@/lib/api-config";
import { httpClient } from "@/lib/http-client";
import { Category } from "@/types";

export async function fetchCategories() {
    return httpClient.get<Category[]>(API_ENDPOINTS.categories.list);
}
