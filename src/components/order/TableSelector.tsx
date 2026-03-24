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
import { Loader2 } from "lucide-react";

interface TableSelectorProps {
  disabled?: boolean;
  lockedTableLabel?: string | null;
}

export function TableSelector({ disabled, lockedTableLabel }: TableSelectorProps) {
  const { tables, isLoading } = useTable();
  const { selectedTable, setSelectedTable } = useOrder();
  const selectedTableInfo = tables.find((table) => table.id === selectedTable);

  const displayValue = selectedTableInfo
    ? `Table ${selectedTableInfo.tableNumber}`
    : lockedTableLabel || undefined;

  return (
    <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <label className="text-xs sm:text-sm font-medium leading-none">Select Table:</label>
      <Select value={selectedTable || ""} onValueChange={setSelectedTable} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-auto min-w-0 sm:min-w-[160px] sm:max-w-[260px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Choose a table">
              {displayValue}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {tables.length === 0 ? (
            <SelectItem value="none" disabled>
              No tables available
            </SelectItem>
          ) : (
            tables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                <div className="flex items-center gap-2">
                  <span>Table {table.tableNumber}</span>
                  <Badge variant="outline" className="text-xs">
                    {table.areaName}
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
