"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { ApiTable } from "@/types";
import { fetchTables } from "@/services/table.service";

interface TableContextType {
  tables: ApiTable[];
  isLoading: boolean;
  error: string | null;
  ensureTablesLoaded: () => Promise<void>;
  refreshTables: () => Promise<void>;
  getTableById: (tableId: string) => ApiTable | undefined;
  getAvailableTables: () => ApiTable[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isFetchingRef = useRef(false);

  const loadTables = useCallback(async () => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
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
      setHasLoaded(true);
    } catch (err) {
      console.error("Error loading tables:", err);
      setError("Không thể tải danh sách bàn. Vui lòng thử lại sau.");
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const ensureTablesLoaded = useCallback(async () => {
    if (hasLoaded || isFetchingRef.current) return;
    await loadTables();
  }, [hasLoaded, loadTables]);

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
        ensureTablesLoaded,
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

  useEffect(() => {
    void context.ensureTablesLoaded();
  }, [context]);

  return context;
}
