"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTable } from "@/contexts/TableContext";
import { useOrder } from "@/contexts/OrderContext";

export function TableSelector() {
    const { tables } = useTable();
    const { selectedTable, setSelectedTable } = useOrder();

    const availableTables = tables.filter((table) => table.status === "available");

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Select Table:</label>
            <Select value={selectedTable || ""} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choose a table" />
                </SelectTrigger>
                <SelectContent>
                    {availableTables.length === 0 ? (
                        <SelectItem value="none" disabled>
                            No tables available
                        </SelectItem>
                    ) : (
                        availableTables.map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                                <div className="flex items-center gap-2">
                                    <span>Table {table.number}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {table.capacity} seats
                                    </Badge>
                                </div>
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
