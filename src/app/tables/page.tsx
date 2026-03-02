"use client";

import { useState } from "react";
import { useTableApi } from "@/hooks/useTableApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TableCard } from "@/components/tables/TableCard";
import { useTable } from "@/contexts/TableContext";
import { useOrder } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/helpers";

const statusFilters: { value: TableStatus | "all"; label: string }[] = [
    { value: "all", label: "All Tables" },
    { value: "available", label: "Available" },
    { value: "occupied", label: "Occupied" },
    { value: "waiting-food", label: "Waiting for Food" },
    { value: "waiting-payment", label: "Waiting for Payment" },
];

export default function TablesPage() {
    // Remove useTable, useOrder for now, use API instead
    const { user, logout, isAuthenticated } = useAuth();
    const [selectedTable, setSelectedTable] = useState<any | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [newStatus, setNewStatus] = useState<string>("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { data, loading, error } = useTableApi(page, pageSize);

    // Filter tables by status
    const filteredTables = data?.data
        ? filter === "all"
            ? data.data
            : data.data.filter((table) => table.status.toLowerCase() === filter)
        : [];

    // Dummy for tableOrder (API does not provide order info)
    const tableOrder = null;

    // Dummy for updateTableStatus (API does not provide update)
    const handleStatusUpdate = () => {
        setSelectedTable(null);
        setNewStatus("");
    };

    // Status counts (API does not provide, so count from filtered data)
    const statusCounts = {
        available: data?.data.filter((t) => t.status.toLowerCase() === "available").length || 0,
        occupied: data?.data.filter((t) => t.status.toLowerCase() === "occupied").length || 0,
        "waiting-food": data?.data.filter((t) => t.status.toLowerCase() === "waiting-food").length || 0,
        "waiting-payment": data?.data.filter((t) => t.status.toLowerCase() === "waiting-payment").length || 0,
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                    Table Management
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {user ? `Welcome, ${user.name.split(" ")[0]}` : "Monitor and manage table status"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={filter}
                                onValueChange={(v) => setFilter(v as TableStatus | "all")}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusFilters.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isAuthenticated && (
                                <Button variant="outline" onClick={logout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" x2="9" y1="12" y2="12" />
                                    </svg>
                                    Logout
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Status Summary */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {statusCounts.available}
                        </div>
                        <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {statusCounts.occupied}
                        </div>
                        <div className="text-sm text-muted-foreground">Occupied</div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {statusCounts["waiting-food"]}
                        </div>
                        <div className="text-sm text-muted-foreground">Waiting Food</div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                            {statusCounts["waiting-payment"]}
                        </div>
                        <div className="text-sm text-muted-foreground">Waiting Payment</div>
                    </div>
                </div>

                {/* Table Grid */}
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading tables...</div>
                ) : error ? (
                    <div className="text-center py-12 text-destructive">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredTables.map((table) => (
                                <TableCard
                                    key={table.id}
                                    table={{
                                        ...table,
                                        tableNumber: table.tableNumber,
                                        number: table.tableNumber, // fallback for legacy Table type, not used for display
                                        status: table.status.toLowerCase() as TableStatus,
                                        capacity: 0, // Not provided by API
                                        positionX: 0,
                                        positionY: 0,
                                    }}
                                    onClick={() => {
                                        setSelectedTable(table);
                                        setNewStatus(table.status.toLowerCase() as TableStatus);
                                    }}
                                />
                            ))}
                        </div>
                        {filteredTables.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No tables found with the selected filter.
                            </div>
                        )}
                        {/* Pagination Controls */}
                        <div className="flex justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                disabled={page === 1 || loading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm">
                                Page {data?.pageNumber || 1} of {data?.totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                disabled={!data?.hasNextPage || loading}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Table Details Dialog */}
            <Dialog
                open={!!selectedTable}
                onOpenChange={(open) => !open && setSelectedTable(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Table {selectedTable?.number}</DialogTitle>
                        <DialogDescription>
                            Capacity: {selectedTable?.capacity} seats
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Current Order Info */}
                        {/* No tableOrder info from API, so nothing to show here */}

                        {/* Status Update */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Update Status
                            </label>
                            <Select
                                value={newStatus}
                                onValueChange={(v) => setNewStatus(v as TableStatus)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="occupied">Occupied</SelectItem>
                                    <SelectItem value="waiting-food">Waiting for Food</SelectItem>
                                    <SelectItem value="waiting-payment">
                                        Waiting for Payment
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTable(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusUpdate}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                        >
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
