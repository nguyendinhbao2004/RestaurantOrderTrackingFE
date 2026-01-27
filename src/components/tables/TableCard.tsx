"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableStatus } from "@/types";
import { getTableStatusColor } from "@/lib/mock-data";
import { TableQRCode } from "@/components/tables/TableQRCode";

interface TableCardProps {
    table: Table;
    onClick?: () => void;
    showQR?: boolean;
}

const statusLabels: Record<TableStatus, string> = {
    available: "Available",
    occupied: "Occupied",
    "waiting-food": "Waiting for Food",
    "waiting-payment": "Waiting for Payment",
};

export function TableCard({ table, onClick, showQR = true }: TableCardProps) {
    const statusColor = getTableStatusColor(table.status);

    return (
        <Card
            className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${table.status === "available"
                    ? "hover:border-emerald-500/50"
                    : "hover:border-violet-500/50"
                }`}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={onClick}
                    >
                        <div
                            className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}
                        />
                        <span className="font-bold text-lg">Table {table.number}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {table.capacity} seats
                    </Badge>
                </div>

                <div className="cursor-pointer" onClick={onClick}>
                    <Badge
                        className={`${statusColor} text-white w-full justify-center py-1`}
                    >
                        {statusLabels[table.status]}
                    </Badge>

                    {table.currentOrderId && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Order: {table.currentOrderId}
                        </p>
                    )}
                </div>

                {showQR && (
                    <div className="mt-3 flex justify-center">
                        <TableQRCode table={table} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
