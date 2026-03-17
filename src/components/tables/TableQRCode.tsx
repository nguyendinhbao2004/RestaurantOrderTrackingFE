"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Table } from "@/types";

interface TableQRCodeProps {
    table: Table;
    baseUrl?: string;
}

export function TableQRCode({ table, baseUrl = "" }: TableQRCodeProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Generate URL for the table
    const orderUrl = `${baseUrl}/order?table=${table.number}`;

    const handleDownload = () => {
        const svg = document.getElementById(`qr-${table.id}`) as HTMLElement;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = `table-${table.number}-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.number} QR Code</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              font-family: sans-serif;
            }
            .container { text-align: center; }
            h1 { margin-bottom: 20px; }
            p { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Table ${table.number}</h1>
            ${document.getElementById(`qr-${table.id}`)?.outerHTML || ""}
            <p>Scan to view menu & order</p>
          </div>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="gap-1"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="5" height="5" x="3" y="3" rx="1" />
                    <rect width="5" height="5" x="16" y="3" rx="1" />
                    <rect width="5" height="5" x="3" y="16" rx="1" />
                    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                    <path d="M21 21v.01" />
                    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                    <path d="M3 12h.01" />
                    <path d="M12 3h.01" />
                    <path d="M12 16v.01" />
                    <path d="M16 12h1" />
                    <path d="M21 12v.01" />
                    <path d="M12 21v-1" />
                </svg>
                QR
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Table {table.number} QR Code</DialogTitle>
                        <DialogDescription>
                            Scan this code to access the menu and place orders
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center py-6">
                        <Card className="p-4 bg-white">
                            <CardContent className="p-0">
                                <QRCodeSVG
                                    id={`qr-${table.id}`}
                                    value={orderUrl}
                                    size={200}
                                    level="H"
                                    includeMargin
                                />
                            </CardContent>
                        </Card>
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            {orderUrl}
                        </p>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={handleDownload}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                            Download
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                            >
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect width="12" height="8" x="6" y="14" />
                            </svg>
                            Print
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
