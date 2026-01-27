import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/contexts/OrderContext";
import { TableProvider } from "@/contexts/TableContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurant Order Tracking | Manage Orders & Tables",
  description: "A comprehensive restaurant management system for tracking orders, managing staff, and monitoring table status in real-time.",
  keywords: ["restaurant", "order tracking", "table management", "staff management", "POS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TableProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </TableProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
