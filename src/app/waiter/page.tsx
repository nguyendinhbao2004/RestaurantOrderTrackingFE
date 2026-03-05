"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { useTable } from "@/contexts/TableContext";
import {
  getOrderStatusColor,
  getTableStatusColor,
  formatDate,
  formatCurrency,
} from "@/lib/helpers";

export default function WaiterPage() {
  const { user, logout } = useAuth();
  const { orders, updateOrderStatus } = useOrder();
  const { tables } = useTable();

  // Orders ready for serving
  const readyOrders = orders.filter((o) => o.status === "ready");
  const activeOrders = orders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled",
  );

  const handleServe = (orderId: string) => {
    updateOrderStatus(orderId, "served");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20 dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Waiter Dashboard
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome, {user?.name?.split(" ")[0]}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/tables">View Tables</Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {readyOrders.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Ready to Serve
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {activeOrders.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Orders</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {tables.filter((t) => t.status === "Occupied").length}
              </div>
              <div className="text-sm text-muted-foreground">
                Occupied Tables
              </div>
            </CardContent>
          </Card>
          <Card className="bg-violet-500/10 border-violet-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {tables.filter((t) => t.status === "Available").length}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Tables
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ready for Serving */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              Ready to Serve
            </h2>
            {readyOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No orders ready to serve
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {readyOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="border-emerald-500/50 bg-emerald-500/5"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Table {order.tableId}
                        </CardTitle>
                        <Badge className="bg-emerald-500 text-white">
                          READY
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 mb-4 text-sm">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.quantity}x {item.menuItem.name}
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleServe(order.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Mark as Served
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Table Overview */}
          <div>
            <h2 className="text-xl font-bold mb-4">Table Overview</h2>
            <div className="grid grid-cols-3 gap-3">
              {tables.slice(0, 12).map((table) => (
                <Card
                  key={table.id}
                  className={`text-center ${
                    table.status === "Available"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : table.status === "Occupied"
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="font-bold">{table.tableNumber}</div>
                    <div
                      className={`text-xs ${getTableStatusColor(table.status)} text-white px-1.5 py-0.5 rounded mt-1 inline-block`}
                    >
                      {table.status.replace("-", " ")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
