"use client";

import { useState } from "react";
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
import { formatCurrency, formatDate } from "@/lib/mock-data";

const statusFilters: { value: TableStatus | "all"; label: string }[] = [
    { value: "all", label: "All Tables" },
    { value: "available", label: "Available" },
    { value: "occupied", label: "Occupied" },
    { value: "waiting-food", label: "Waiting for Food" },
    { value: "waiting-payment", label: "Waiting for Payment" },
];

export default function TablesPage() {
    const { tables, updateTableStatus } = useTable();
    const { orders } = useOrder();
    const { user, logout, isAuthenticated } = useAuth();
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [filter, setFilter] = useState<TableStatus | "all">("all");
    const [newStatus, setNewStatus] = useState<TableStatus | "">("");

    const filteredTables =
        filter === "all"
            ? tables
            : tables.filter((table) => table.status === filter);

    const tableOrder = selectedTable?.currentOrderId
        ? orders.find((o) => o.id === selectedTable.currentOrderId)
        : null;

    const handleStatusUpdate = () => {
        if (selectedTable && newStatus) {
            updateTableStatus(selectedTable.id, newStatus);
            setSelectedTable(null);
            setNewStatus("");
        }
    };

    const statusCounts = {
        available: tables.filter((t) => t.status === "available").length,
        occupied: tables.filter((t) => t.status === "occupied").length,
        "waiting-food": tables.filter((t) => t.status === "waiting-food").length,
        "waiting-payment": tables.filter((t) => t.status === "waiting-payment")
            .length,
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredTables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onClick={() => {
                                setSelectedTable(table);
                                setNewStatus(table.status);
                            }}
                        />
                    ))}
                </div>

                {filteredTables.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No tables found with the selected filter.
                    </div>
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
                        {tableOrder && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-medium mb-2">Current Order</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order ID:</span>
                                        <span>{tableOrder.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant="outline">{tableOrder.status}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(tableOrder.totalAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time:</span>
                                        <span>{formatDate(tableOrder.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

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
