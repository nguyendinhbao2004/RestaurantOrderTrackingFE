"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock3,
  ChefHat,
  UserCheck,
  X,
  Check,
  CheckCircle2,
  Flame,
  LayoutList,
  StickyNote,
} from "lucide-react";
import {
  getOrderItemsByAccount,
  getAvailableChefs,
  updateOrderItemStatus,
  updateOrderStatus,
  type OrderItemByAccount,
  type AvailableChef,
} from "@/services/head-chef.service";

// ==================== CONSTANTS ====================

const SPECIALTY_LABELS: Record<string, string> = {
  "2": "Món Á",
  "3": "Món Âu",
};

const STATUS_LABELS: Record<string, string> = {
  "0": "Chờ xác nhận",
  "1": "Chưa phân công",
  "2": "Đang nấu",
};

type ViewMode = "priority" | "by-dish";

// ==================== TYPES ====================

interface DishGroup {
  productId: string;
  productName: string;
  status: string;
  items: OrderItemByAccount[];
  // oldest orderAt in the group (used for sort in priority)
  oldestAt: string;
}

// ==================== HELPERS ====================

function getMinutesAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return `${mins} phút trước`;
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// ==================== SUB-COMPONENTS ====================

/** Single order-item card — used in Priority mode */
function ItemCard({
  item,
  onConfirm,
  onAssign,
  isConfirming,
  isAssigned,
}: {
  item: OrderItemByAccount;
  onConfirm: (item: OrderItemByAccount) => void;
  onAssign: (item: OrderItemByAccount) => void;
  isConfirming: boolean;
  isAssigned: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-background px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold mb-1.5 truncate">
          {item.productName}
        </p>
        {/* Note */}
        {item.note && (
          <div className="mb-1.5 flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-xs font-medium leading-snug">
              {item.note}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {/* Order type */}
          <Badge
            variant="outline"
            className="rounded-md text-xs py-0 px-2 font-normal"
          >
            {item.orderType || "—"}
          </Badge>

          {/* Table / area */}
          {item.tableNumber != null ? (
            <span>
              Bàn {item.tableNumber}
              {item.areaName ? ` · ${item.areaName}` : ""}
            </span>
          ) : (
            <span>Không có bàn</span>
          )}

          {/* Time */}
          <span className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {getMinutesAgo(item.orderAt)}
          </span>

          {/* Short order ID */}
          <span>Mã: {shortId(item.orderId)}</span>

          {/* Created by */}
          <span>Tạo bởi: {item.createdByName || item.createdBy || "—"}</span>
        </div>
      </div>

      {/* Right: action */}
      <div className="flex items-center gap-3 shrink-0">
        {item.status === "0" ? (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
            onClick={() => onConfirm(item)}
            disabled={isConfirming}
          >
            <Check className="h-4 w-4" />
            {isConfirming ? "Đang xác nhận..." : "Xác nhận"}
          </Button>
        ) : item.status === "1" ? (
          <Button
            size="sm"
            variant={isAssigned ? "secondary" : "default"}
            className="flex items-center gap-1.5"
            onClick={() => onAssign(item)}
            disabled={isAssigned}
          >
            <UserCheck className="h-4 w-4" />
            {isAssigned ? "Đã phân công" : "Phân công"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Grouped dish card — used in By-dish mode */
function DishGroupCard({
  group,
  onAssignGroup,
  onConfirmGroup,
  confirmingIds,
  assignedIds,
}: {
  group: DishGroup;
  onAssignGroup: (items: OrderItemByAccount[]) => void;
  onConfirmGroup: (items: OrderItemByAccount[]) => void;
  confirmingIds: Set<string>;
  assignedIds: Set<string>;
}) {
  const qty = group.items.length;
  const isAnyConfirming = group.items.some((i) =>
    confirmingIds.has(i.orderItemId),
  );
  const allAssigned = group.items.every((i) => assignedIds.has(i.orderItemId));
  // Collect unique metadata for display
  const orderTypes = [
    ...new Set(group.items.map((i) => i.orderType).filter(Boolean)),
  ];
  const tables = [
    ...new Set(
      group.items
        .filter((i) => i.tableNumber != null)
        .map(
          (i) => `Bàn ${i.tableNumber}${i.areaName ? ` · ${i.areaName}` : ""}`,
        ),
    ),
  ];
  const hasDelivery = group.items.some((i) => i.tableNumber == null);

  // Collect notes from all items in the group (non-empty, with their index)
  const noteEntries = group.items
    .map((i, idx) => ({ note: i.note, idx }))
    .filter((e) => !!e.note);

  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-background px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold mb-1.5 truncate">
          {group.productName}
        </p>
        {/* Notes — styled amber blocks (same as chef page) */}
        {noteEntries.length > 0 && (
          <div className="mb-1.5 flex flex-col gap-1">
            {noteEntries.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              >
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-xs font-medium leading-snug">
                  {qty > 1 && (
                    <span className="mr-1 font-bold opacity-60">
                      #{entry.idx + 1}
                    </span>
                  )}
                  {entry.note}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {/* Order types */}
          {orderTypes.map((ot) => (
            <Badge
              key={ot}
              variant="outline"
              className="rounded-md text-xs py-0 px-2 font-normal"
            >
              {ot}
            </Badge>
          ))}

          {/* Tables */}
          {tables.length > 0 && <span>{tables.join(", ")}</span>}
          {hasDelivery && tables.length === 0 && <span>Không có bàn</span>}

          {/* Oldest time */}
          <span className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {getMinutesAgo(group.oldestAt)}
          </span>

          {/* Status */}
          <Badge
            variant={group.status === "1" ? "outline" : "secondary"}
            className="rounded-md text-xs py-0 px-2"
          >
            {STATUS_LABELS[group.status] ?? group.status}
          </Badge>
        </div>
      </div>

      {/* Right: quantity badge + action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* SL badge */}
        <div className="flex flex-col items-center rounded-xl border bg-muted px-3 py-1.5 min-w-[48px]">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            SL
          </span>
          <span className="text-lg font-bold leading-none">{qty}</span>
        </div>

        {/* Action */}
        {group.status === "0" ? (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
            onClick={() => onConfirmGroup(group.items)}
            disabled={isAnyConfirming}
          >
            <Check className="h-4 w-4" />
            {isAnyConfirming ? "Đang xác nhận..." : "Xác nhận tất cả"}
          </Button>
        ) : group.status === "1" ? (
          <Button
            size="sm"
            variant={allAssigned ? "secondary" : "default"}
            className="flex items-center gap-1.5"
            onClick={() => onAssignGroup(group.items)}
            disabled={allAssigned}
          >
            <UserCheck className="h-4 w-4" />
            {allAssigned ? "Đã phân công" : "Phân công tất cả"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function HeadChefPage() {
  const { user, logout } = useAuth();
  const [clock, setClock] = useState(() => new Date());

  // Order items list state
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<OrderItemByAccount[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());

  // Status filter: "pending" = chờ xử lý (0+1), "cooking" = đang nấu (2)
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // View mode: "priority" | "by-dish"
  const [viewMode, setViewMode] = useState<ViewMode>("priority");

  // Pagination
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Assign popup state — can hold single item or multiple items (group)
  const [popupItems, setPopupItems] = useState<OrderItemByAccount[]>([]);
  const [chefs, setChefs] = useState<AvailableChef[]>([]);
  const [chefsLoading, setChefsLoading] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [assigningChefId, setAssigningChefId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch order items by account
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getOrderItemsByAccount();
      setItems(data);
    } catch (error) {
      const fallback = "Không thể tải danh sách món ăn.";
      setErrorMessage(
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message || fallback)
          : fallback,
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    if (statusFilter === "pending")
      return items.filter((i) => i.status === "0" || i.status === "1");
    if (statusFilter === "cooking")
      return items.filter((i) => i.status === "2");
    return items;
  }, [items, statusFilter]);

  /** Priority mode: sort ascending by orderAt (oldest first) */
  const priorityItems = useMemo(
    () =>
      [...filteredItems].sort(
        (a, b) => new Date(a.orderAt).getTime() - new Date(b.orderAt).getTime(),
      ),
    [filteredItems],
  );

  /** By-dish mode: group by productName+status, then sort groups oldest first */
  const dishGroups = useMemo<DishGroup[]>(() => {
    const map = new Map<string, DishGroup>();
    for (const item of filteredItems) {
      const key = `${item.productName}__${item.status}`;
      if (!map.has(key)) {
        map.set(key, {
          productId: item.productId,
          productName: item.productName,
          status: item.status,
          items: [],
          oldestAt: item.orderAt,
        });
      }
      const g = map.get(key)!;
      g.items.push(item);
      if (new Date(item.orderAt) < new Date(g.oldestAt)) {
        g.oldestAt = item.orderAt;
      }
    }
    return [...map.values()].sort(
      (a, b) => new Date(a.oldestAt).getTime() - new Date(b.oldestAt).getTime(),
    );
  }, [filteredItems]);

  // Reset to page 1 when filter or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, viewMode]);

  // Paginated slices
  const totalRows =
    viewMode === "by-dish" ? dishGroups.length : priorityItems.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;

  const pagedPriorityItems = useMemo(
    () => priorityItems.slice(pageStart, pageEnd),
    [priorityItems, pageStart, pageEnd],
  );
  const pagedDishGroups = useMemo(
    () => dishGroups.slice(pageStart, pageEnd),
    [dishGroups, pageStart, pageEnd],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openAssignPopup = async (itemsToAssign: OrderItemByAccount[]) => {
    setPopupItems(itemsToAssign);
    setSpecialtyFilter("all");
    setChefsLoading(true);
    setChefs([]);
    try {
      const list = await getAvailableChefs();
      setChefs(list);
    } catch {
      setChefs([]);
    } finally {
      setChefsLoading(false);
    }
  };

  const closePopup = () => {
    setPopupItems([]);
    setChefs([]);
    setAssigningChefId(null);
  };

  const handleAssignChef = async (chef: AvailableChef) => {
    if (!popupItems.length || !user?.id) return;
    setAssigningChefId(chef.accountId);
    try {
      const res = await updateOrderItemStatus({
        orderItemIds: popupItems.map((i) => i.orderItemId),
        newStatus: 2,
        accountId: user.id,
        changeSource: "manual",
        assigneeId: chef.accountId,
      });

      const orderIdsToUpdate = new Set<string>();
      popupItems.forEach((item) => {
        if (item.orderType === "Delivery" || item.orderType === "TakeAway") {
          orderIdsToUpdate.add(item.orderId);
        }
      });

      if (orderIdsToUpdate.size > 0) {
        await Promise.all(
          Array.from(orderIdsToUpdate).map((orderId) =>
            updateOrderStatus({
              id: orderId,
              newStatus: 2,
            }).catch((err) => {
              console.error(
                `Failed to update order status to 2 for order ${orderId}:`,
                err,
              );
            }),
          ),
        );
      }

      const successMessage = res.message || "Phân công thành công.";
      setAssignedIds((prev) => {
        const next = new Set(prev);
        popupItems.forEach((i) => next.add(i.orderItemId));
        return next;
      });
      closePopup();
      setToast({ message: successMessage });
      setTimeout(() => {
        setToast(null);
        fetchItems();
      }, 3000);
    } catch {
      // keep popup open on error
    } finally {
      setAssigningChefId(null);
    }
  };

  const handleConfirmItems = async (itemsToConfirm: OrderItemByAccount[]) => {
    if (!user?.id) return;

    // Kiểm tra xem có món nào bị chặn không
    // Chặn nếu là Delivery hoặc TakeAway MÀ orderStatus không phải là "1"
    const hasInvalidItem = itemsToConfirm.some(
      (item) =>
        (item.orderType === "Delivery" || item.orderType === "TakeAway") &&
        item.orderStatus !== "1"
    );

    if (hasInvalidItem) {
      setToast({
        message: "không thể cập nhật cho món ăn của đơn chưa được xác nhận",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Nếu không bị chặn thì cho phép xác nhận toàn bộ
    const validItems = itemsToConfirm;

    setConfirmingIds((prev) => {
      const next = new Set(prev);
      validItems.forEach((i) => next.add(i.orderItemId));
      return next;
    });
    try {
      const res = await updateOrderItemStatus({
        orderItemIds: validItems.map((i) => i.orderItemId),
        newStatus: 1,
        accountId: user.id,
        changeSource: "manual",
        assigneeId: null,
      });

      const deliveryOrderIds = new Set<string>();
      validItems.forEach((item) => {
        deliveryOrderIds.add(item.orderId);
      });

      if (deliveryOrderIds.size > 0) {
        await Promise.all(
          Array.from(deliveryOrderIds).map((orderId) =>
            updateOrderStatus({ id: orderId, newStatus: 1 }).catch((err) => {
              console.error(
                `Failed to update order status for Delivery order ${orderId}:`,
                err,
              );
            }),
          ),
        );
      }

      const successMessage = res.message || "Xác nhận thành công.";
      setToast({ message: successMessage });
      setTimeout(() => {
        setToast(null);
        fetchItems();
      }, 3000);
    } catch {
      // keep state on error
    } finally {
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        validItems.forEach((i) => next.delete(i.orderItemId));
        return next;
      });
    }
  };

  const filteredChefs =
    specialtyFilter === "all"
      ? chefs
      : chefs.filter((c) => c.specialty === specialtyFilter);

  const displayCount =
    viewMode === "by-dish" ? dishGroups.length : filteredItems.length;
  const popupRepresentative = popupItems[0] ?? null;

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <div>
              <p className="text-2xl font-bold leading-none">Head Chef</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.name || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="rounded-full border bg-muted px-3 py-1.5 text-lg font-semibold tabular-nums">
              <Clock3 className="mr-2 inline h-4 w-4" />
              {clock.toLocaleTimeString("vi-VN", { hour12: false })}
            </div>
            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
        {/* Title bar */}
        <section className="mb-5 flex flex-col gap-4 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border bg-muted p-2.5">
              <ChefHat className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold">
              Danh sách món ăn cần phân công
            </h2>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-base"
            >
              {filteredItems.length} món
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchItems}
            disabled={isLoading}
          >
            Làm mới
          </Button>
        </section>

        {/* ── Filter row ── */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Status filter tabs — 2 modes */}
          <div className="flex items-center gap-1 rounded-xl border bg-background p-1">
            {[
              {
                label: "Chờ xử lý",
                value: "pending",
                count: items.filter((i) => i.status === "0" || i.status === "1")
                  .length,
              },
              {
                label: "Đang nấu",
                value: "cooking",
                count: items.filter((i) => i.status === "2").length,
              },
            ].map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={statusFilter === tab.value ? "default" : "ghost"}
                onClick={() => setStatusFilter(tab.value)}
              >
                {tab.label}
                <Badge
                  variant={statusFilter === tab.value ? "secondary" : "outline"}
                  className="ml-1.5 rounded-full px-1.5 py-0 text-xs"
                >
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* View mode toggle — pushed to end */}
          <div className="flex items-center gap-1 rounded-xl border bg-background p-1 ml-auto">
            <Button
              size="sm"
              variant={viewMode === "priority" ? "default" : "ghost"}
              onClick={() => setViewMode("priority")}
              className="flex items-center gap-1.5"
            >
              <Flame className="h-3.5 w-3.5" />
              Ưu tiên
            </Button>
            <Button
              size="sm"
              variant={viewMode === "by-dish" ? "default" : "ghost"}
              onClick={() => setViewMode("by-dish")}
              className="flex items-center gap-1.5"
            >
              <LayoutList className="h-3.5 w-3.5" />
              Theo món
            </Button>
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              Đang tải danh sách món ăn...
            </CardContent>
          </Card>
        ) : errorMessage ? (
          <Card>
            <CardContent className="py-14 text-center">
              <p className="font-medium text-destructive">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              Không có món ăn nào trong trạng thái này.
            </CardContent>
          </Card>
        ) : viewMode === "priority" ? (
          /* ── Priority view: list sorted oldest → newest ── */
          <div className="space-y-3">
            {pagedPriorityItems.map((item) => (
              <ItemCard
                key={item.orderItemId}
                item={item}
                onConfirm={handleConfirmItems.bind(null, [item])}
                onAssign={() => openAssignPopup([item])}
                isConfirming={confirmingIds.has(item.orderItemId)}
                isAssigned={assignedIds.has(item.orderItemId)}
              />
            ))}
          </div>
        ) : (
          /* ── By-dish view: grouped cards ── */
          <div className="space-y-3">
            {pagedDishGroups.map((group) => (
              <DishGroupCard
                key={`${group.productName}__${group.status}`}
                group={group}
                onAssignGroup={(its) => openAssignPopup(its)}
                onConfirmGroup={(its) => handleConfirmItems(its)}
                confirmingIds={confirmingIds}
                assignedIds={assignedIds}
              />
            ))}
          </div>
        )}

        {/* Footer: pagination + count */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2"
                aria-label="Trang đầu"
              >
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2"
                aria-label="Trang trước"
              >
                ‹
              </Button>

              {/* Page number buttons — show up to 5 around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2)
                .map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(p)}
                    className="min-w-[36px]"
                  >
                    {p}
                  </Button>
                ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2"
                aria-label="Trang sau"
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2"
                aria-label="Trang cuối"
              >
                »
              </Button>
            </div>
          )}

          {/* Count label */}
          <p className="text-sm text-muted-foreground">
            {viewMode === "by-dish"
              ? `Trang ${currentPage}/${totalPages} · ${pagedDishGroups.length} nhóm / tổng ${dishGroups.length} nhóm (${filteredItems.length} order items)`
              : `Trang ${currentPage}/${totalPages} · Hiển thị ${pageStart + 1}–${Math.min(pageEnd, priorityItems.length)} / ${filteredItems.length} món`}
          </p>
        </div>
      </main>

      {/* ==================== ASSIGN POPUP ==================== */}
      {popupItems.length > 0 && popupRepresentative && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-xl">
            {/* Popup header */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold">Chọn đầu bếp phân công</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePopup}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Món:{" "}
              <span className="font-semibold text-foreground">
                {popupRepresentative.productName}
              </span>
              {popupItems.length > 1 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-full text-xs"
                >
                  ×{popupItems.length}
                </Badge>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {popupRepresentative.tableNumber != null ? (
                <Badge variant="outline" className="text-xs rounded-md">
                  🪑 Bàn {popupRepresentative.tableNumber}
                  {popupRepresentative.areaName
                    ? ` · ${popupRepresentative.areaName}`
                    : ""}
                </Badge>
              ) : null}
              {popupRepresentative.orderType ? (
                <Badge variant="outline" className="text-xs rounded-md">
                  {popupRepresentative.orderType}
                </Badge>
              ) : null}
            </div>

            {/* Specialty filter tabs */}
            <div className="flex items-center gap-2 rounded-xl border bg-muted p-1 mb-4">
              {[
                { label: "Tất cả", value: "all" },
                { label: "Món Á", value: "2" },
                { label: "Món Âu", value: "3" },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  size="sm"
                  variant={
                    specialtyFilter === tab.value ? "secondary" : "ghost"
                  }
                  onClick={() => setSpecialtyFilter(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Chef list */}
            {chefsLoading ? (
              <p className="py-8 text-center text-muted-foreground">
                Đang tải danh sách đầu bếp...
              </p>
            ) : filteredChefs.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Không có đầu bếp khả dụng.
              </p>
            ) : (
              <div className="max-h-[350px] overflow-y-auto space-y-2">
                {filteredChefs.map((chef) => (
                  <div
                    key={chef.accountId}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{chef.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {SPECIALTY_LABELS[chef.specialty] ??
                          `Nhóm ${chef.specialty}`}
                        {" · "}Trình độ: {chef.skillLevel}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignChef(chef)}
                      disabled={assigningChefId !== null}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {assigningChefId === chef.accountId
                        ? "Đang gán..."
                        : "Chọn"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 shadow-lg dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}
