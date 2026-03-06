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

export function TableSelector({ disabled }: { disabled?: boolean }) {
  const { tables, isLoading } = useTable();
  const { selectedTable, setSelectedTable } = useOrder();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Select Table:</label>
      <Select value={selectedTable || ""} onValueChange={setSelectedTable} disabled={disabled}>
        <SelectTrigger className="w-auto min-w-[160px] max-w-[260px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Choose a table" />
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
