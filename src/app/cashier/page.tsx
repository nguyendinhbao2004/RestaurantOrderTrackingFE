"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { useTable } from "@/contexts/TableContext";
import { formatCurrency, formatDate } from "@/lib/helpers";

export default function CashierPage() {
  const { user, logout } = useAuth();
  const { orders } = useOrder();
  const { tables } = useTable();

  // Orders waiting for payment
  const waitingPaymentTables = tables.filter(
    (t) => t.status === "WaitingPayment",
  );
  const servedOrders = orders.filter((o) => o.status === "served");

  // Calculate daily totals
  const todayRevenue = servedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayOrders = servedOrders.length;

  const handleCompletePayment = (tableId: string) => {
    // TODO: Call API to update table status
    console.log("Complete payment for table:", tableId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/20 dark:to-background">
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
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Cashier Dashboard
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome, {user?.name?.split(" ")[0]}
                </p>
              </div>
            </div>
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
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-rose-500/10 border-rose-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {waitingPaymentTables.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Awaiting Payment
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(todayRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Today&apos;s Revenue
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {todayOrders}
              </div>
              <div className="text-sm text-muted-foreground">
                Orders Completed
              </div>
            </CardContent>
          </Card>
          <Card className="bg-violet-500/10 border-violet-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {todayOrders > 0
                  ? formatCurrency(todayRevenue / todayOrders)
                  : "$0"}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Order Value
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Payments */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              Awaiting Payment
            </h2>
            {waitingPaymentTables.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No tables waiting for payment
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {waitingPaymentTables.map((table) => {
                  const tableOrder = orders.find(
                    (o) => o.tableId === table.id && o.status === "served",
                  );
                  return (
                    <Card
                      key={table.id}
                      className="border-rose-500/50 bg-rose-500/5"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Table {table.tableNumber}
                          </CardTitle>
                          <Badge className="bg-rose-500 text-white">
                            PAYMENT DUE
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {tableOrder && (
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-muted-foreground">
                              Order #{tableOrder.id}
                            </p>
                            {tableOrder.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x {item.menuItem.name}
                                </span>
                                <span>
                                  {formatCurrency(
                                    item.menuItem.price * item.quantity,
                                  )}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total</span>
                              <span className="text-emerald-600">
                                {formatCurrency(tableOrder.totalAmount)}
                              </span>
                            </div>
                          </div>
                        )}
                        <Button
                          onClick={() => handleCompletePayment(table.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Complete Payment
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {servedOrders
                    .slice(-5)
                    .reverse()
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Table {order.tableId} •{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Paid
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {servedOrders.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No transactions yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
