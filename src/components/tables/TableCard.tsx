"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableStatus } from "@/types";
import { getTableStatusColor } from "@/lib/helpers";
import { TableQRCode } from "@/components/tables/TableQRCode";
import { QrCode, Loader2 } from "lucide-react";

interface TableCardProps {
    table: Table & { tableNumber?: string; qrCode?: string | null };
    onClick?: () => void;
    showQR?: boolean;
    onGenerateQR?: () => void;
    isGeneratingQR?: boolean;
    onRefreshQR?: () => void;
    isRefreshingQR?: boolean;
}

const statusLabels: Record<TableStatus, string> = {
    available: "Trống",
    occupied: "Có khách",
    "waiting-food": "Chờ món",
    "waiting-payment": "Chờ thanh toán",
};

export function TableCard({ table, onClick, showQR = true, onGenerateQR, isGeneratingQR = false, onRefreshQR, isRefreshingQR = false }: TableCardProps) {
    const statusColor = getTableStatusColor(table.status);

    // Prefer table.tableNumber if present, else fallback to table.number
    const displayTableNumber = table.tableNumber || table.number;

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
                        <span className="font-bold text-lg">Bàn {displayTableNumber}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {table.capacity} chỗ
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
                            Đơn: {table.currentOrderId}
                        </p>
                    )}
                </div>

                {showQR && (
                    <div className="mt-3 flex justify-center">
                        <TableQRCode table={table} />
                    </div>
                )}

                {onGenerateQR && table.status === "available" && (!table.qrCode || table.qrCode === "null" || table.qrCode.length < 100) && (
                    <div className="mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 text-violet-600 border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
                            onClick={(e) => { e.stopPropagation(); onGenerateQR(); }}
                            disabled={isGeneratingQR}
                        >
                            {isGeneratingQR
                                ? <Loader2 size={14} className="animate-spin" />
                                : <QrCode size={14} />}
                            Tạo QR Code
                        </Button>
                    </div>
                )}

                {onRefreshQR && table.status !== "available" && (!table.qrCode || table.qrCode === "null" || table.qrCode.length < 100) && (
                    <div className="mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                            onClick={(e) => { e.stopPropagation(); onRefreshQR(); }}
                            disabled={isRefreshingQR}
                        >
                            {isRefreshingQR
                                ? <Loader2 size={14} className="animate-spin" />
                                : <QrCode size={14} />}
                            Tải lại QR
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
