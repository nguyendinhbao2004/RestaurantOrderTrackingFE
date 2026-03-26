"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Grid3X3,
  Settings,
  Volume2,
  CheckCircle2,
  StickyNote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChefOrderItems,
  updateOrderItemStatus,
  type ChefOrderItem,
} from "@/services/chef.service";
import { getOrderById, updateOrderStatus } from "@/services/order.service";

interface QueueItem {
  id: string; // id của item
  oldestId: string; // id của item có createdAt xa nhất (để Xong 1 phần)
  allIds: string[]; // tất cả id trong nhóm (để Xong tất cả)
  orderId: string;
  productName: string;
  notes: { note: string; createdAt: string }[]; // note kèm thời gian tạo của từng order item
  status: string;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
  quantity: number;
  tableNumber: string | null;
  areaName: string | null;
  orderType: string | null;
}

const statusLabelMap: Record<string, string> = {
  pending: "Chờ chế biến",
  cooking: "Đang nấu",
  ready: "Sẵn sàng",
  served: "Đã phục vụ",
  cancelled: "Đã hủy",
};

function getMinutesAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return `${mins} phút trước`;
}

function ToastBanner({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 3000);
    const remove = setTimeout(() => onDone(), 3400);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#16a34a",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          fontSize: 14,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
        {message}
      </div>
    </div>
  );
}

export default function ChefPage() {
  const { user, logout } = useAuth();
  const [clock, setClock] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<ChefOrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null,
  );

  const showToast = useCallback((message: string) => {
    setToast({ message, key: Date.now() });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrderItems = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getChefOrderItems();
        setItems(response.data ?? []);
        setCurrentPage(1); // reset về trang 1 khi fetch mới
      } catch (error) {
        const fallback = "Không thể tải dữ liệu món đang chờ chế biến.";
        if (error && typeof error === "object" && "message" in error) {
          setErrorMessage(String(error.message || fallback));
        } else {
          setErrorMessage(fallback);
        }
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderItems();
  }, []);

  const queueItems = useMemo<QueueItem[]>(() => {
    // Map key -> {rep item + mảng tất cả raw items trong nhóm + note entries để sort}
    const grouped = new Map<
      string,
      {
        qi: QueueItem;
        rawItems: ChefOrderItem[];
        noteEntries: { note: string; createdAt: string }[];
      }
    >();

    for (const item of items) {
      const key = [item.productName, item.status].join("|");
      const existing = grouped.get(key);

      if (existing) {
        existing.qi.quantity += 1;
        existing.qi.allIds.push(item.id);
        // Thu thập note kèm thời gian tạo để sort sau
        if (item.note)
          existing.noteEntries.push({
            note: item.note,
            createdAt: item.createdAt,
          });
        // Cập nhật createdAt nếu item này cũ hơn (xa hơn)
        if (
          new Date(item.createdAt).getTime() <
          new Date(existing.qi.createdAt).getTime()
        ) {
          existing.qi.createdAt = item.createdAt;
          existing.qi.oldestId = item.id;
        }
        if (!existing.qi.createdByName && item.createdByName) {
          existing.qi.createdByName = item.createdByName;
        }
        existing.rawItems.push(item);
        continue;
      }

      grouped.set(key, {
        qi: {
          id: item.id,
          oldestId: item.id,
          allIds: [item.id],
          orderId: item.orderId,
          productName: item.productName,
          notes: [],
          status: item.status,
          createdAt: item.createdAt,
          createdBy: item.createdBy,
          createdByName: item.createdByName,
          quantity: 1,
          tableNumber: item.tableNumber,
          areaName: item.areaName,
          orderType: item.orderType,
        },
        rawItems: [item],
        noteEntries: item.note
          ? [{ note: item.note, createdAt: item.createdAt }]
          : [],
      });
    }

    // Sort noteEntries theo createdAt tăng dần → note của item tạo lâu nhất lên đầu
    for (const g of grouped.values()) {
      g.qi.notes = g.noteEntries.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return Array.from(grouped.values())
      .map((g) => g.qi)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(queueItems.length / 5));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = queueItems.slice(
    (safeCurrentPage - 1) * 5,
    safeCurrentPage * 5,
  );

  const pendingCount = queueItems.filter(
    (item) => item.status.toLowerCase() === "pending",
  ).length;

  const handleCompleteOne = async (item: QueueItem) => {
    const targetId = item.oldestId;
    setUpdatingIds((prev) => new Set(prev).add(targetId));
    try {
      const res = await updateOrderItemStatus({
        orderItemIds: [targetId],
        newStatus: 3,
        accountId: user?.id ?? null,
        changeSource: "manual",
        assigneeId: null,
      });
      // Xóa item đó ra khỏi danh sách local
      setItems((prev) => prev.filter((i) => i.id !== targetId));
      if (res?.message) showToast(res.message);

      if (item.orderType === "TakeAway") {
        try {
          const orderRes = await getOrderById(item.orderId);
          if (orderRes.data && orderRes.data.orderItems) {
            const allReady = orderRes.data.orderItems.every(
              (oi) => oi.status === "Ready" || String(oi.status) === "3"
            );
            if (allReady) {
              await updateOrderStatus({ id: item.orderId, newStatus: 4 });
            }
          }
        } catch (err) {
          console.error("Lỗi cập nhật trạng thái đơn hàng TakeAway:", err);
        }
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái xong 1 phần:", err);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  const handleCompleteAll = async (item: QueueItem) => {
    const ids = item.allIds;
    // Đánh dấu đang loading cho tất cả id trong nhóm
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    try {
      const res = await updateOrderItemStatus({
        orderItemIds: ids,
        newStatus: 3,
        accountId: user?.id ?? null,
        changeSource: "manual",
        assigneeId: null,
      });
      // Xóa tất cả item trong nhóm ra khỏi danh sách local
      const idSet = new Set(ids);
      setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
      if (res?.message) showToast(res.message);

      if (item.orderType === "TakeAway") {
        try {
          const orderRes = await getOrderById(item.orderId);
          if (orderRes.data && orderRes.data.orderItems) {
            const allReady = orderRes.data.orderItems.every(
              (oi) => oi.status === "Ready" || String(oi.status) === "3"
            );
            if (allReady) {
              await updateOrderStatus({ id: item.orderId, newStatus: 4 });
            }
          }
        } catch (err) {
          console.error("Lỗi cập nhật trạng thái đơn hàng TakeAway:", err);
        }
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái xong tất cả:", err);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Toast notification */}
      {toast && (
        <ToastBanner
          key={toast.key}
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
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
            <h2 className="text-3xl font-bold">
              Danh sách món ăn chờ chế biến
            </h2>
          </div>

          {/* <div className="flex flex-wrap items-center gap-2">
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
          </div> */}
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
          <section className="space-y-2">
            {paginatedItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border bg-card px-4 py-3 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3 lg:justify-between">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-2xl font-bold leading-tight truncate">
                      {item.productName}
                    </h3>
                    {item.notes.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {item.notes.map((entry, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          >
                            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1 text-xs font-medium leading-snug">
                              {item.quantity > 1 && (
                                <span className="mr-1 font-bold opacity-60">
                                  #{idx + 1}
                                </span>
                              )}
                              {entry.note}
                            </span>
                            {item.quantity > 1 && (
                              <span className="ml-2 shrink-0 text-xs opacity-60">
                                <Clock3 className="mr-0.5 inline h-3 w-3" />
                                {getMinutesAgo(entry.createdAt)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Order type badge */}
                      {item.orderType && (
                        <Badge
                          variant="outline"
                          className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                            item.orderType === "Delivery"
                              ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                              : item.orderType === "TakeAway"
                                ? "border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-600 dark:bg-purple-950/40 dark:text-purple-300"
                                : "border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/40 dark:text-green-300"
                          }`}
                        >
                          {item.orderType === "Delivery"
                            ? "Giao hàng"
                            : item.orderType === "TakeAway"
                              ? "Mang về"
                              : "Tại bàn"}
                        </Badge>
                      )}
                      {/* Table / Area badges */}
                      {item.areaName && (
                        <Badge
                          variant="outline"
                          className="rounded-lg px-2 py-0.5 text-xs"
                        >
                          {item.areaName}
                        </Badge>
                      )}
                      {item.tableNumber && (
                        <Badge
                          variant="secondary"
                          className="rounded-lg px-2 py-0.5 text-xs font-bold"
                        >
                          Bàn {item.tableNumber}
                        </Badge>
                      )}
                      {!item.tableNumber && !item.areaName && (
                        <Badge
                          variant="outline"
                          className="rounded-lg px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          Không có bàn
                        </Badge>
                      )}
                      {item.quantity === 1 && (
                        <Badge
                          variant="outline"
                          className="rounded-lg px-2 py-0.5 text-xs"
                        >
                          <Clock3 className="mr-1 h-3 w-3" />
                          {getMinutesAgo(item.createdAt)}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Mã: {item.orderId.slice(0, 8).toUpperCase()} • Tạo bởi:{" "}
                        {item.createdByName ??
                          item.createdBy ??
                          "Khách tự order"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-14 rounded-xl border bg-muted px-1.5 py-2 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        SL
                      </p>
                      <p className="text-2xl font-bold leading-none">
                        {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.quantity > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingIds.has(item.oldestId)}
                          onClick={() => handleCompleteOne(item)}
                        >
                          {updatingIds.has(item.oldestId)
                            ? "Đang lưu..."
                            : "Xong 1 phần"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={item.allIds.some((id) => updatingIds.has(id))}
                        onClick={() => handleCompleteAll(item)}
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {item.allIds.some((id) => updatingIds.has(id))
                          ? "Đang lưu..."
                          : "Xong tất cả"}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="mt-4 flex items-center justify-between rounded-2xl border bg-background px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Trang {safeCurrentPage}/{totalPages} • Tổng {queueItems.length} nhóm
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
            >
              ← Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === safeCurrentPage ? "default" : "ghost"}
                size="sm"
                className="w-8"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
            >
              Sau →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
