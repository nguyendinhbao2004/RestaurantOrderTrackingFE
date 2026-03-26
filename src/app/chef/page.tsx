"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Grid3X3,
  Settings,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { type Pagination } from "@/lib/http-client";
import { getChefOrderItems, type ChefOrderItem } from "@/services/chef.service";

interface QueueItem {
  id: string;
  orderId: string;
  productName: string;
  status: string;
  tableNumber: string;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
  quantity: number;
}

const defaultPagination: Pagination = {
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const statusLabelMap: Record<string, string> = {
  pending: "Chờ chế biến",
  cooking: "Đang nấu",
  ready: "Sẵn sàng",
  served: "Đã phục vụ",
  cancelled: "Đã hủy",
};

const ORDER_ITEMS_PAGE_SIZE = 10;

function getMinutesAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return `${mins} phút trước`;
}

export default function ChefPage() {
  const { user, logout } = useAuth();
  const [clock, setClock] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<ChefOrderItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [pageIndex, setPageIndex] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrderItems = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getChefOrderItems(
          pageIndex,
          ORDER_ITEMS_PAGE_SIZE,
        );

        setItems(response.data ?? []);
        setPagination(response.meta?.pagination ?? defaultPagination);
      } catch (error) {
        const fallback = "Không thể tải dữ liệu món đang chờ chế biến.";
        if (error && typeof error === "object" && "message" in error) {
          setErrorMessage(String(error.message || fallback));
        } else {
          setErrorMessage(fallback);
        }
        setItems([]);
        setPagination(defaultPagination);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderItems();
  }, [pageIndex]);

  const queueItems = useMemo<QueueItem[]>(() => {
    const grouped = new Map<string, QueueItem>();

    for (const item of items) {
      const key = [
        item.orderId,
        item.productName,
        item.tableNumber,
        item.status,
      ].join("|");
      const existing = grouped.get(key);

      if (existing) {
        existing.quantity += 1;
        if (
          new Date(item.createdAt).getTime() <
          new Date(existing.createdAt).getTime()
        ) {
          existing.createdAt = item.createdAt;
        }
        if (!existing.createdByName && item.createdByName) {
          existing.createdByName = item.createdByName;
        }
        continue;
      }

      grouped.set(key, {
        id: item.id,
        orderId: item.orderId,
        productName: item.productName,
        status: item.status,
        tableNumber: item.tableNumber,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
        createdByName: item.createdByName,
        quantity: 1,
      });
    }

    return Array.from(grouped.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [items]);

  const pendingCount = queueItems.filter(
    (item) => item.status.toLowerCase() === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <p className="text-2xl font-bold leading-none">
                KDS Bếp Trung Tâm
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chef {user?.name?.split(" ")[0] || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <div className="rounded-full border bg-muted px-3 py-1.5 text-lg font-semibold tabular-nums">
              <Clock3 className="mr-2 inline h-4 w-4" />
              {clock.toLocaleTimeString("vi-VN", { hour12: false })}
            </div>

            <Button variant="ghost" size="icon" aria-label="Volume">
              <Volume2 className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
        <section className="mb-5 flex flex-col gap-4 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border bg-muted p-2.5">
              <Grid3X3 className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold">Chờ chế biến</h2>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-base"
            >
              {pendingCount} order
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border bg-muted p-1">
              <Button variant="secondary" size="sm">
                Ưu tiên
              </Button>
              <Button variant="ghost" size="sm">
                Theo món
              </Button>
              <Button variant="ghost" size="sm">
                Theo phòng/bàn
              </Button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              Đang tải danh sách món...
            </CardContent>
          </Card>
        ) : errorMessage ? (
          <Card>
            <CardContent className="py-14 text-center">
              <p className="font-medium">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : queueItems.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              Không có món nào trong hàng chờ.
            </CardContent>
          </Card>
        ) : (
          <section className="space-y-4">
            {queueItems.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border bg-card px-5 py-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <h3 className="text-4xl font-bold leading-tight">
                      {item.productName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-xl px-3 py-1 text-lg"
                      >
                        Bàn {item.tableNumber}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-xl px-3 py-1 text-lg"
                      >
                        <Clock3 className="mr-1.5 h-4 w-4" />
                        {getMinutesAgo(item.createdAt)}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      Mã: {item.orderId.slice(0, 8).toUpperCase()} • Tạo bởi:{" "}
                      {item.createdByName ?? item.createdBy ?? "Khách tự order"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 lg:ml-auto">
                    <div className="w-20 rounded-2xl border bg-muted px-2 py-3 text-center">
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        SL
                      </p>
                      <p className="text-4xl font-bold leading-none">
                        {item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.quantity > 1 && (
                        <Button size="lg" variant="outline">
                          Xong 1 phần
                        </Button>
                      )}
                      <Button size="lg">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Xong tất cả
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Trạng thái:{" "}
                  {statusLabelMap[item.status.toLowerCase()] ?? item.status}
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {pagination.pageNumber}/{Math.max(1, pagination.totalPages)} •
            Tổng {pagination.totalRecords} món
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPreviousPage || isLoading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={!pagination.hasNextPage || isLoading}
            >
              Sau
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
