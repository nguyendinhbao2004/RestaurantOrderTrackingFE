import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api-config";

export interface TableApi {
  id: string;
  tableNumber: string;
  areaName: string;
  status: string;
}

export interface TableApiResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: TableApi[];
  succeeded: boolean;
  message: string;
  errors: string[];
}

export function useTableApi(pageIndex: number, pageSize: number, enabled = true) {
  const [data, setData] = useState<TableApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    fetch(
      `${API_BASE_URL}/api/Table?PageIndex=${pageIndex}&PageSize=${pageSize}`
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch tables");
        setLoading(false);
      });
  }, [pageIndex, pageSize, enabled]);

  return { data, loading, error };
}
