"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { ApiTable } from "@/types";
import { fetchTables } from "@/services/table.service";

interface TableContextType {
  tables: ApiTable[];
  isLoading: boolean;
  error: string | null;
  refreshTables: () => Promise<void>;
  getTableById: (tableId: string) => ApiTable | undefined;
  getAvailableTables: () => ApiTable[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchTables({
        pageIndex: 1,
        pageSize: 100, // Fetch all tables
      });

      // Only keep tables with "Available" status
      const availableTables = response.data.filter(
        (table) => table.status === "Available",
      );
      setTables(availableTables);
    } catch (err) {
      console.error("Error loading tables:", err);
      setError("Không thể tải danh sách bàn. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const getTableById = useCallback(
    (tableId: string) => {
      return tables.find((table) => table.id === tableId);
    },
    [tables],
  );

  const getAvailableTables = useCallback(() => {
    return tables.filter((table) => table.status === "Available");
  }, [tables]);

  return (
    <TableContext.Provider
      value={{
        tables,
        isLoading,
        error,
        refreshTables: loadTables,
        getTableById,
        getAvailableTables,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
