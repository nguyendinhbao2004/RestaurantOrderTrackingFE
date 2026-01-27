"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Table, TableStatus } from '@/types';
import { tables as initialTables } from '@/lib/mock-data';

interface TableContextType {
    tables: Table[];
    updateTableStatus: (tableId: string, status: TableStatus, orderId?: string) => void;
    getTableById: (tableId: string) => Table | undefined;
    getAvailableTables: () => Table[];
    getTablesByStatus: (status: TableStatus) => Table[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
    const [tables, setTables] = useState<Table[]>(initialTables);

    const updateTableStatus = useCallback((tableId: string, status: TableStatus, orderId?: string) => {
        setTables((prevTables) =>
            prevTables.map((table) =>
                table.id === tableId
                    ? {
                        ...table,
                        status,
                        currentOrderId: status === 'available' ? undefined : orderId || table.currentOrderId
                    }
                    : table
            )
        );
    }, []);

    const getTableById = useCallback((tableId: string) => {
        return tables.find((table) => table.id === tableId);
    }, [tables]);

    const getAvailableTables = useCallback(() => {
        return tables.filter((table) => table.status === 'available');
    }, [tables]);

    const getTablesByStatus = useCallback((status: TableStatus) => {
        return tables.filter((table) => table.status === status);
    }, [tables]);

    return (
        <TableContext.Provider
            value={{
                tables,
                updateTableStatus,
                getTableById,
                getAvailableTables,
                getTablesByStatus,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}

export function useTable() {
    const context = useContext(TableContext);
    if (context === undefined) {
        throw new Error('useTable must be used within a TableProvider');
    }
    return context;
}
