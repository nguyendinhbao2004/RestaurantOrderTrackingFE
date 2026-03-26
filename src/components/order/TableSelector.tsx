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

export function TableSelector({
  disabled,
  lockedTableLabel,
}: TableSelectorProps) {
  const { tables, isLoading } = useTable();
  const { selectedTable, setSelectedTable } = useOrder();
  const selectedTableInfo = tables.find((table) => table.id === selectedTable);

  const displayValue = selectedTableInfo
    ? `Bàn ${selectedTableInfo.tableNumber}` // Cập nhật nhẹ phần hiển thị thành "Bàn" thay vì "Table" cho đồng bộ tiếng Việt
    : lockedTableLabel || undefined;

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <label className="text-[11px] sm:text-sm font-medium leading-none text-muted-foreground sm:text-foreground">
        Bàn:
      </label>
      <Select
        value={selectedTable || ""}
        onValueChange={setSelectedTable}
        disabled={disabled}
      >
        <SelectTrigger className="w-full min-w-0 sm:w-auto sm:min-w-[170px] sm:max-w-[260px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-muted-foreground text-sm">Đang tải...</span>
            </div>
          ) : (
            <SelectValue placeholder="Chọn bàn">{displayValue}</SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {tables.length === 0 ? (
            <SelectItem value="none" disabled>
              Không có bàn
            </SelectItem>
          ) : (
            tables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                <div className="flex items-center gap-2">
                  <span>Bàn {table.tableNumber}</span>
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