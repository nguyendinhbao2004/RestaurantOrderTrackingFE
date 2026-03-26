"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Banknote,
  CreditCard,
  CheckCircle2,
  LogOut,
  RefreshCw,
  UtensilsCrossed,
  Receipt,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useBanks } from "@/contexts/BanksContext";
import { fetchTableDetail, fetchTables } from "@/services/table.service";
import { fetchProducts } from "@/services/product.service";
import { fetchCategories } from "@/services/category.service";
import {
  createBill,
  getPaymentInfoByOrderId,
  payBill,
  PaymentInfoByOrderData,
} from "@/services/cashier.service";
import {
  ApiOrderType,
  createOrder,
  createOrderItems,
  resolveOrderId,
  updateOrderStatus,
} from "@/services/order.service";
import {
  buildVietQrImageUrl,
  createPaymentLink,
  PaymentLinkData,
} from "@/services/online-order.service";
import {
  CashierCheckInNotice,
  consumeCashierCheckInNotice,
} from "@/services/work-schedule.service";
import { formatCurrency, mapProductsToMenuItems } from "@/lib/helpers";
import { usePaymentSuccessSignalR, type PaymentMessage,} from "@/hooks/usePaymentSuccessSignalR";
import { MenuItem, Category } from "@/types";

/* ─────────────────────── Types ─────────────────────── */

interface ApiTable {
  id: string;
  tableNumber: string;
  areaName: string;
  status: string; // "Available" | "Occupied" | "Reserved"
  capacity: number;
}

interface TableOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  note?: string;
  status?: string;
}

interface TableOrder {
  id: string;
  orderType?: string;
  status: string;
  totalAmount?: number;
  items: TableOrderItem[];
}

interface TableDetail extends ApiTable {
  qrCode: string | null;
  orders: TableOrder[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

type PaymentMethod = "cash" | "bank";
type CopyField = "accountNumber" | "amount" | "description";

const TABLE_PAGE_SIZE = 18;
const TABLE_GRID_SLOT_COUNT = 18;
const MENU_PAGE_SIZE = 6;
const DEFAULT_PAYMENT_ORDER_STATUS = 4;
const ORDER_TYPE_TOGGLE_OPTIONS = [
  { value: ApiOrderType.DineIn, label: "TẠI CHỖ" },
  { value: ApiOrderType.TakeAway, label: "MANG VỀ" },
] as const;

/* ─────────────────────── Helpers ─────────────────────── */

function normalizeTableStatus(status: string | number) {
  const normalized = String(status)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  switch (normalized) {
    case "0":
    case "available":
      return "available";
    case "1":
    case "occupied":
      return "occupied";
    case "2":
    case "reserved":
      return "reserved";
    case "3":
    case "outofservice":
      return "outofservice";
    default:
      return normalized;
  }
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

function getTableStatusLabel(status: string) {
  switch (normalizeTableStatus(status)) {
    case "available":
      return "Trống";
    case "occupied":
      return "Đã đặt trước";
    case "reserved":
      return "Đang phục vụ";
    case "outofservice":
      return "Ngưng phục vụ";
    default:
      return status;
  }
}

function getTableStatusColors(status: string) {
  switch (normalizeTableStatus(status)) {
    case "available":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
        badge:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        dot: "bg-emerald-500",
      };
    case "occupied":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    case "reserved":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    case "outofservice":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
        badge:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
        dot: "bg-rose-500",
      };
    default:
      return {
        bg: "bg-muted border-border",
        badge: "bg-muted text-muted-foreground",
        dot: "bg-stone-400",
      };
  }
}

function getCheckInNoticeStyles(type: CashierCheckInNotice["type"]) {
  switch (type) {
    case "success":
      return {
        container:
          "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100",
        icon: "text-emerald-600 dark:text-emerald-300",
      };
    case "warning":
      return {
        container:
          "border-amber-200 bg-amber-50/95 text-amber-900 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-100",
        icon: "text-amber-600 dark:text-amber-300",
      };
    default:
      return {
        container:
          "border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-100",
        icon: "text-rose-600 dark:text-rose-300",
      };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOrEmpty(value: unknown) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumberOrZero(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapTableOrder(rawOrder: Record<string, unknown>): TableOrder {
  const rawItems = Array.isArray(rawOrder.orderItems)
    ? rawOrder.orderItems
    : Array.isArray(rawOrder.items)
      ? rawOrder.items
      : [];

  const items: TableOrderItem[] = rawItems
    .filter(isRecord)
    .map((rawItem) => ({
      id: toStringOrEmpty(rawItem.id),
      productId: toStringOrEmpty(rawItem.productId),
      productName: toStringOrEmpty(rawItem.productName),
      quantity: toNumberOrZero(rawItem.quantity),
      unitPrice: toNumberOrZero(rawItem.unitPrice ?? rawItem.price),
      note:
        rawItem.note === null || rawItem.note === undefined
          ? undefined
          : toStringOrEmpty(rawItem.note),
      status:
        rawItem.status === null || rawItem.status === undefined
          ? undefined
          : toStringOrEmpty(rawItem.status),
    }))
    .filter((item) => item.productId || item.productName);

  return {
    id: toStringOrEmpty(rawOrder.id),
    orderType:
      rawOrder.orderType === null || rawOrder.orderType === undefined
        ? undefined
        : toStringOrEmpty(rawOrder.orderType),
    status: toStringOrEmpty(rawOrder.status),
    totalAmount: toNumberOrZero(rawOrder.totalAmount),
    items,
  };
}

function mapTableDetailResponse(raw: unknown): TableDetail | null {
  if (!isRecord(raw)) return null;

  const rawOrders = raw.orders ?? raw.Orders;
  const orderList = Array.isArray(rawOrders)
    ? rawOrders
    : isRecord(rawOrders)
      ? [rawOrders]
      : [];

  const orders = orderList
    .filter(isRecord)
    .map(mapTableOrder)
    .filter((order) => order.id);

  return {
    id: toStringOrEmpty(raw.id),
    tableNumber: toStringOrEmpty(raw.tableNumber),
    areaName: toStringOrEmpty(raw.areaName),
    status: toStringOrEmpty(raw.status),
    qrCode: typeof raw.qrCode === "string" ? raw.qrCode : null,
    capacity: toNumberOrZero(raw.capacity),
    orders,
  };
}

/* ─────────────────────── Component ─────────────────────── */

export default function CashierPOSPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { findBankByBin } = useBanks();

  /* ── Tables ── */
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<
    "all" | "available" | "occupied"
  >("all");
  const [selectedAreaName, setSelectedAreaName] = useState("all");
  const [tablePage, setTablePage] = useState(1);
  const [tableTotalPages, setTableTotalPages] = useState(1);

  const [selectedTable, setSelectedTable] = useState<ApiTable | null>(null);
  const [tableDetail, setTableDetail] = useState<TableDetail | null>(null);
  const [tableDetailLoading, setTableDetailLoading] = useState(false);

  /* ── Menu ── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuPage, setMenuPage] = useState(1);
  const [menuTotalPages, setMenuTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Cart ── */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<ApiOrderType>(ApiOrderType.DineIn);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [saveOrderError, setSaveOrderError] = useState<string | null>(null);
  const [isAddingItemsMode, setIsAddingItemsMode] = useState(false);

  /* ── Payment Modal ── */
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [isCheckingPaymentInfo, setIsCheckingPaymentInfo] = useState(false);
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [billId, setBillId] = useState("");
  const [paymentLinkData, setPaymentLinkData] =
    useState<PaymentLinkData | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isAwaitingTransferConfirmation, setIsAwaitingTransferConfirmation] =
    useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pendingPaymentOrderId, setPendingPaymentOrderId] = useState("");
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const [checkInNotice, setCheckInNotice] =
    useState<CashierCheckInNotice | null>(null);

  /* ── Derived ── */
  const selectedBank = useMemo(() => {
    if (!paymentLinkData?.bin) return undefined;
    return findBankByBin(paymentLinkData.bin);
  }, [findBankByBin, paymentLinkData]);

  const paymentQrImageUrl = useMemo(() => {
    if (!paymentLinkData) return null;
    return buildVietQrImageUrl(paymentLinkData);
  }, [paymentLinkData]);

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
    [cart],
  );

  const cartItemCount = useMemo(
    () => cart.reduce((s, i) => s + i.quantity, 0),
    [cart],
  );

  // active order on selected table
  const activeOrder = useMemo(() => {
    if (!tableDetail) return null;
    return (
      tableDetail.orders.find(
        (o) => o.status !== "Completed" && o.status !== "Cancelled",
      ) || null
    );
  }, [tableDetail]);

  const activeOrderItems = useMemo(
    () => activeOrder?.items ?? [],
    [activeOrder],
  );

  const activeOrderTotal = useMemo(() => {
    if (!activeOrder) return 0;
    if ((activeOrder.totalAmount ?? 0) > 0) {
      return activeOrder.totalAmount ?? 0;
    }
    return activeOrder.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
  }, [activeOrder]);

  const displayTotal = useMemo(() => {
    if (cart.length > 0) return cartTotal;
    return activeOrderTotal;
  }, [activeOrderTotal, cart.length, cartTotal]);

  const displayItemCount = useMemo(() => {
    if (cartItemCount > 0) return cartItemCount;
    return activeOrderItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [activeOrderItems, cartItemCount]);

  const paymentSummaryItems = useMemo(() => {
    if (activeOrderItems.length > 0) {
      return activeOrderItems.map((item) => ({
        key: item.id || item.productId,
        name: item.productName,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
      }));
    }

    return cart.map((item) => ({
      key: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      total: item.menuItem.price * item.quantity,
    }));
  }, [activeOrderItems, cart]);

  const paymentSummaryTotal = useMemo(() => {
    if (activeOrder) return activeOrderTotal;
    return cartTotal;
  }, [activeOrder, activeOrderTotal, cartTotal]);

  const shouldHideCheckoutButton = useMemo(() => {
    if (!activeOrder) return false;

    const normalizedOrderType = (activeOrder.orderType ?? "")
      .trim()
      .toLowerCase();
    const normalizedOrderStatus = activeOrder.status.trim().toLowerCase();

    return (
      normalizedOrderType === "takeaway" &&
      normalizedOrderStatus === "confirmed"
    );
  }, [activeOrder]);

  const cashChange = useMemo(() => {
    const given = parseFloat(cashGiven.replace(/[^0-9]/g, "")) || 0;
    return given - paymentSummaryTotal;
  }, [cashGiven, paymentSummaryTotal]);

  const menuItemById = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item])),
    [menuItems],
  );

  const checkInNoticeStyles = useMemo(() => {
    if (!checkInNotice) return null;
    return getCheckInNoticeStyles(checkInNotice.type);
  }, [checkInNotice]);

  /* ─── Filtered menu items ─── */
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (selectedCategory !== "all") {
      items = items.filter((i) => i.categoryName === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  /* ─── Load tables ─── */
  const loadTables = useCallback(async () => {
    setTablesLoading(true);
    setTablesError(null);
    try {
      const res = await fetchTables({
        pageIndex: tablePage,
        pageSize: TABLE_PAGE_SIZE,
      });
      setTables(res.data as unknown as ApiTable[]);
      const pagination = (res as any).meta?.pagination;
      if (pagination) setTableTotalPages(pagination.totalPages);
    } catch {
      setTablesError("Không thể tải danh sách bàn.");
    } finally {
      setTablesLoading(false);
    }
  }, [tablePage]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  /* ─── Load menu products ─── */
  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const res = await fetchProducts({
        pageIndex: menuPage,
        pageSize: MENU_PAGE_SIZE,
      });
      setMenuItems(mapProductsToMenuItems(res.data));
      const pagination = (res as any).meta?.pagination;
      if (pagination) setMenuTotalPages(pagination.totalPages);
    } catch {
      // silently ignore
    } finally {
      setMenuLoading(false);
    }
  }, [menuPage]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  /* ─── Load categories ─── */
  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const notice = consumeCashierCheckInNotice();
    if (!notice) return;

    setCheckInNotice(notice);
  }, []);

  useEffect(() => {
    if (!checkInNotice) return;

    const timer = window.setTimeout(() => {
      setCheckInNotice(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [checkInNotice]);

  const loadTableDetail = useCallback(async (tableId: string) => {
    setTableDetailLoading(true);
    try {
      const res = await fetchTableDetail(tableId);
      setTableDetail(mapTableDetailResponse(res.data));
    } catch {
      setTableDetail(null);
    } finally {
      setTableDetailLoading(false);
    }
  }, []);

  /* ─── Select table ─── */
  const handleSelectTable = useCallback(
    async (table: ApiTable) => {
      setSelectedTable(table);
      setCart([]);
      setTableDetail(null);
      setSaveOrderError(null);
      setIsAddingItemsMode(false);
      await loadTableDetail(table.id);
    },
    [loadTableDetail],
  );

  /* ─── Cart operations ─── */
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.menuItem.id === id ? { ...c, quantity: qty } : c)),
      );
    }
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
  }, []);

  /* ─── Save order (Lưu thêm món) ─── */
  const handleSaveOrder = useCallback(async () => {
    if (!selectedTable || cart.length === 0) return;

    if (!user?.id) {
      setSaveOrderError("Không tìm thấy tài khoản đăng nhập.");
      return;
    }

    const tableStatus = normalizeTableStatus(selectedTable.status);
    if (tableStatus === "outofservice") {
      setSaveOrderError("Bàn đang ngưng phục vụ, không thể lưu món.");
      return;
    }

    setIsSavingOrder(true);
    setSaveOrderError(null);

    try {
      let targetOrderId = activeOrder?.id ?? null;

      if (tableStatus === "available") {
        const createOrderRes = await createOrder({
          tableId: selectedTable.id,
          accountId: user.id,
          orderType,
        });

        targetOrderId = resolveOrderId(createOrderRes.data);
        if (!targetOrderId) {
          throw new Error("Không lấy được orderId từ phản hồi tạo order.");
        }
      } else if (!targetOrderId) {
        throw new Error("Không tìm thấy order hiện tại của bàn.");
      }

      await createOrderItems({
        orderId: targetOrderId,
        orderChannel: "Offline",
        createdBy: user.id,
        items: cart.map((item) => ({
          productId: item.menuItem.id,
          note: "",
          quantity: item.quantity,
        })),
      });

      setCart([]);
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id ? { ...t, status: "Occupied" } : t,
        ),
      );
      setSelectedTable((prev) =>
        prev ? { ...prev, status: "Occupied" } : prev,
      );

      await Promise.all([loadTables(), loadTableDetail(selectedTable.id)]);
    } catch (error) {
      setSaveOrderError(
        getApiErrorMessage(error, "Không thể lưu món. Vui lòng thử lại."),
      );
    } finally {
      setIsSavingOrder(false);
    }
  }, [
    activeOrder,
    cart,
    loadTableDetail,
    loadTables,
    orderType,
    selectedTable,
    user,
  ]);

  /* ─── Open payment modal ─── */
  const openPaymentModal = useCallback(() => {
    setPaymentMethod("cash");
    setCashGiven("");
    setIsCheckingPaymentInfo(false);
    setBillId("");
    setPaymentLinkData(null);
    setPaymentSuccess(false);
    setIsAwaitingTransferConfirmation(false);
    setPaymentError(null);
    setPendingPaymentOrderId("");
    setCopiedField(null);
    setShowPaymentModal(true);
  }, []);

  const preparePaymentFlow = useCallback(async (orderId: string) => {
    const paymentInfoRes = await getPaymentInfoByOrderId(orderId);
    const paymentInfoData: PaymentInfoByOrderData = paymentInfoRes.data;
    const currentBillId = paymentInfoData.billId?.trim() || "";

    setPendingPaymentOrderId(orderId);
    setBillId(currentBillId);

    if (!paymentInfoData.paymentMetadata) {
      setPaymentLinkData(null);
      setPaymentMethod("cash");
      await updateOrderStatus({
        id: orderId,
        newStatus: DEFAULT_PAYMENT_ORDER_STATUS,
      });
      return;
    }

    setPaymentMethod("bank");
    setPaymentLinkData({
      bin: paymentInfoData.paymentMetadata.bin,
      accountNumber: paymentInfoData.paymentMetadata.accountNumber,
      accountName: paymentInfoData.paymentMetadata.accountName,
      amount: paymentInfoData.amount,
      description: paymentInfoData.paymentMetadata.description,
      orderCode: paymentInfoData.orderCode,
      currency: "VND",
      paymentLinkId: "",
      status: paymentInfoData.status,
      checkoutUrl: "",
      qrCode: paymentInfoData.paymentMetadata.qrCode,
    });
  }, []);

  const handleCreateBillAndPayment = useCallback(async () => {
    openPaymentModal();
    if (!activeOrder) return;

    setPaymentError(null);
    setIsCheckingPaymentInfo(true);

    try {
      await preparePaymentFlow(activeOrder.id);
    } catch (error) {
      setPaymentError(
        getApiErrorMessage(
          error,
          "Không thể kiểm tra thông tin thanh toán. Vui lòng thử lại.",
        ),
      );
    } finally {
      setIsCheckingPaymentInfo(false);
    }
  }, [activeOrder, openPaymentModal, preparePaymentFlow]);

  const markTableAvailable = useCallback(() => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id ? { ...t, status: "Available" } : t,
      ),
    );
    setCart([]);
    setTableDetail(null);
    setSelectedTable(null);
    setIsAddingItemsMode(false);
  }, [selectedTable]);

  /* ─── Create bill + handle payment ─── */
  const handleConfirmPayment = useCallback(async () => {
    if (!activeOrder || !user || isCheckingPaymentInfo) return;

    const orderId = activeOrder.id;
    const isBankPayment = paymentMethod === "bank";

    setPaymentError(null);
    setIsAwaitingTransferConfirmation(false);
    setPaymentSuccess(false);

    if (isBankPayment) {
      setIsCreatingLink(true);
    } else {
      setIsCreatingBill(true);
    }

    try {
      let nextBillId = billId.trim();
      if (!nextBillId) {
        await updateOrderStatus({
          id: orderId,
          newStatus: DEFAULT_PAYMENT_ORDER_STATUS,
        });

        const billRes = await createBill({
          orderId,
          cashierAccountId: user.id,
          paymentMethod: isBankPayment ? 3 : 1,
          discount: 0,
        });

        nextBillId = String(billRes.data ?? "").trim();
      }

      if (!nextBillId) {
        throw new Error("Không lấy được billId để tiếp tục thanh toán.");
      }

      setBillId(nextBillId);

      if (isBankPayment) {
        const linkRes = await createPaymentLink({ billId: nextBillId });
        setPendingPaymentOrderId(orderId);
        setPaymentLinkData(linkRes.data);
        return;
      }

      await payBill({ billId: nextBillId });

      setPendingPaymentOrderId("");
      setPaymentLinkData(null);
      setIsAwaitingTransferConfirmation(false);
      setPaymentSuccess(true);
      markTableAvailable();
    } catch (error) {
      setPaymentError(
        getApiErrorMessage(
          error,
          isBankPayment
            ? "Không thể tạo mã chuyển khoản. Vui lòng thử lại."
            : "Không thể thanh toán hóa đơn. Vui lòng thử lại.",
        ),
      );
    } finally {
      setIsCreatingBill(false);
      setIsCreatingLink(false);
    }
  }, [
    activeOrder,
    billId,
    isCheckingPaymentInfo,
    markTableAvailable,
    paymentMethod,
    user,
  ]);

  const handleMarkTransferDone = useCallback(() => {
    if (!pendingPaymentOrderId && !activeOrder?.id) {
      return;
    }

    setPaymentError(null);
    setIsAwaitingTransferConfirmation(true);
  }, [activeOrder?.id, pendingPaymentOrderId]);

  const handleClosePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
  }, []);

  const paymentSignalROrderCodes = useMemo(() => {
    const orderCode = paymentLinkData?.orderCode;
    if (!Number.isFinite(orderCode) || !orderCode || orderCode <= 0) {
      return [];
    }

    return [Math.trunc(orderCode)];
  }, [paymentLinkData?.orderCode]);

  const handlePaymentSuccessMessage = useCallback(
    (message: PaymentMessage) => {
      const incomingOrderId = message.orderId.trim();
      const incomingOrderCode =
        Number.isFinite(message.orderCode) && message.orderCode > 0
          ? Math.trunc(message.orderCode)
          : 0;

      const targetOrderId = (
        pendingPaymentOrderId ||
        activeOrder?.id ||
        ""
      ).trim();
      const targetOrderCode =
        paymentLinkData?.orderCode && paymentLinkData.orderCode > 0
          ? Math.trunc(paymentLinkData.orderCode)
          : 0;

      const isMatchedByOrderId =
        !!incomingOrderId &&
        !!targetOrderId &&
        incomingOrderId === targetOrderId;
      const isMatchedByOrderCode =
        incomingOrderCode > 0 &&
        targetOrderCode > 0 &&
        incomingOrderCode === targetOrderCode;

      if (!isMatchedByOrderId && !isMatchedByOrderCode) return;

      setPaymentError(null);
      setPaymentLinkData(null);
      setIsAwaitingTransferConfirmation(false);
      setPendingPaymentOrderId("");
      setPaymentSuccess(true);
      setShowPaymentModal(true);
      markTableAvailable();
    },
    [
      activeOrder?.id,
      markTableAvailable,
      paymentLinkData?.orderCode,
      pendingPaymentOrderId,
    ],
  );

  usePaymentSuccessSignalR(handlePaymentSuccessMessage, {
    enabled:
      isAuthenticated &&
      paymentMethod === "bank" &&
      showPaymentModal &&
      !!paymentLinkData,
    subscribeOrderCodes: paymentSignalROrderCodes,
    requireToken: true,
  });

  /* ─── Copy helper ─── */
  const copyValue = useCallback(async (field: CopyField, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField((c) => (c === field ? null : c)), 1500);
    } catch {}
  }, []);

  const tableAreas = useMemo(() => {
    const uniqueAreas = new Set(
      tables
        .map((table) => table.areaName?.trim())
        .filter((area): area is string => Boolean(area)),
    );
    return Array.from(uniqueAreas).sort((a, b) => a.localeCompare(b, "vi"));
  }, [tables]);

  /* ─── Filtered tables ─── */
  const filteredTables = useMemo(() => {
    let statusFilteredTables = tables;

    if (tableFilter === "available") {
      statusFilteredTables = tables.filter(
        (t) => normalizeTableStatus(t.status) === "available",
      );
    } else if (tableFilter === "occupied") {
      statusFilteredTables = tables.filter((t) => {
        const status = normalizeTableStatus(t.status);
        return status === "occupied" || status === "reserved";
      });
    }

    if (selectedAreaName === "all") return statusFilteredTables;

    return statusFilteredTables.filter(
      (table) => table.areaName?.trim() === selectedAreaName,
    );
  }, [selectedAreaName, tableFilter, tables]);

  const tableGridSlots = useMemo(
    () =>
      Array.from(
        { length: TABLE_GRID_SLOT_COUNT },
        (_, index) => filteredTables[index] ?? null,
      ),
    [filteredTables],
  );

  useEffect(() => {
    if (selectedAreaName === "all") return;
    if (tableAreas.includes(selectedAreaName)) return;
    setSelectedAreaName("all");
  }, [selectedAreaName, tableAreas]);

  /* ─────────────── RENDER ─────────────── */

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-950 overflow-hidden">
      {checkInNotice && checkInNoticeStyles && (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
          <div
            className={`pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${checkInNoticeStyles.container}`}
          >
            <div className="flex items-start gap-2.5">
              {checkInNotice.type === "success" ? (
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${checkInNoticeStyles.icon}`}
                />
              ) : (
                <AlertCircle
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${checkInNoticeStyles.icon}`}
                />
              )}
              <p className="text-sm font-medium leading-5">
                {checkInNotice.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white dark:bg-stone-900 border-b border-border shadow-sm z-20">
        <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-orange-600 leading-tight">
                POS Thu Ngân
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Chào, {user?.name ?? "Thu ngân"}
              </p>
            </div>

            <div className="inline-flex items-center rounded-2xl bg-stone-200 dark:bg-stone-800 p-1 ml-1">
              {ORDER_TYPE_TOGGLE_OPTIONS.map((option) => {
                const isActive = orderType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setOrderType(option.value)}
                    className={`h-10 px-4 sm:px-6 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      isActive
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                        : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTables}
              className="text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── 2-column body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {!isAddingItemsMode ? (
          <div className="flex-1 min-w-[260px] flex flex-col border-r border-border bg-white dark:bg-stone-900">
            <div className="px-3 py-3 border-b border-border flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-stone-900">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  className="h-7 px-2.5 text-xs"
                  disabled={!selectedTable}
                  onClick={() => setIsAddingItemsMode(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Mở menu gọi món
                </Button>
              </div>
              <h2 className="text-sm font-bold mb-2 text-stone-700 dark:text-stone-200">
                Sơ đồ bàn
              </h2>
              <div className="flex gap-1 flex-wrap">
                {(
                  [
                    { value: "all", label: "Tất cả" },
                    { value: "available", label: "Trống" },
                    { value: "occupied", label: "Có khách" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTableFilter(f.value)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                      tableFilter === f.value
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-transparent text-muted-foreground border-border hover:border-orange-400 hover:text-orange-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <label
                  htmlFor="table-area-filter"
                  className="text-xs font-medium text-muted-foreground whitespace-nowrap"
                >
                  Khu vực
                </label>
                <select
                  id="table-area-filter"
                  value={selectedAreaName}
                  onChange={(event) => setSelectedAreaName(event.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs"
                >
                  <option value="all">Tất cả khu vực</option>
                  {tableAreas.map((areaName) => (
                    <option key={areaName} value={areaName}>
                      {areaName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {tablesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <p className="text-xs text-muted-foreground">
                    Đang tải bàn...
                  </p>
                </div>
              ) : tablesError ? (
                <div className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-xs text-destructive">{tablesError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                    onClick={loadTables}
                  >
                    Thử lại
                  </Button>
                </div>
              ) : (
                <div className="p-3 grid grid-cols-6 gap-3">
                  {filteredTables.length === 0 ? (
                    <div className="col-span-6 text-center py-8 text-xs text-muted-foreground">
                      Không có bàn phù hợp
                    </div>
                  ) : (
                    tableGridSlots.map((table, index) => {
                      if (!table) {
                        return (
                          <div
                            key={`table-empty-${index}`}
                            className="h-[110px]"
                          />
                        );
                      }

                      const isSelected = selectedTable?.id === table.id;
                      return (
                        <button
                          key={table.id}
                          onClick={() => handleSelectTable(table)}
                          className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
                        >
                          <TableFloorPlan
                            capacity={table.capacity}
                            status={table.status}
                            isSelected={isSelected}
                            tableNumber={table.tableNumber}
                          />
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </ScrollArea>

            {tableTotalPages > 1 && (
              <div className="px-3 pb-3 flex items-center justify-center gap-1 border-t border-border pt-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground px-1">
                  {tablePage}/{tableTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() =>
                    setTablePage((p) => Math.min(tableTotalPages, p + 1))
                  }
                  disabled={tablePage === tableTotalPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0 bg-stone-50 dark:bg-stone-950 border-r border-border">
            <div className="px-4 py-3 border-b border-border bg-white dark:bg-stone-900 flex-shrink-0 sticky top-0 z-10">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setIsAddingItemsMode(false)}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Quay lại sơ đồ bàn
                </Button>
                <div className="inline-flex rounded-lg bg-stone-100 dark:bg-stone-800 p-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingItemsMode(false)}
                    className="h-7 rounded-md px-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
                  >
                    Sơ đồ bàn
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingItemsMode(true)}
                    className="h-7 rounded-md px-2.5 text-xs font-semibold bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                  >
                    Menu
                  </button>
                </div>
              </div>
              <h2 className="text-sm font-bold text-stone-700 dark:text-stone-200 mb-2.5">
                Menu món ăn
              </h2>
              <div className="relative mb-2.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm món ăn..."
                  className="pl-9 rounded-full text-sm h-9"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-transparent text-muted-foreground border-border hover:text-orange-600 hover:border-orange-300"
                  }`}
                >
                  Tất cả
                </button>
                {categories
                  .filter((c) => c.isActive)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                        selectedCategory === cat.name
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-transparent text-muted-foreground border-border hover:text-orange-600 hover:border-orange-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {menuLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                  <p className="text-sm text-muted-foreground">
                    Đang tải thực đơn...
                  </p>
                </div>
              ) : (
                <div className="p-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground text-sm">
                        Không tìm thấy món ăn
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {filteredItems.map((item) => (
                        <MenuCard
                          key={item.id}
                          item={item}
                          onAdd={() => addToCart(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex-shrink-0 border-t border-border py-2 flex items-center justify-center gap-2 bg-white dark:bg-stone-900">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setMenuPage((p) => Math.max(1, p - 1))}
                disabled={menuPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: menuTotalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === menuPage ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 rounded-full ${
                      p === menuPage ? "bg-orange-600 text-white border-0" : ""
                    }`}
                    onClick={() => setMenuPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() =>
                  setMenuPage((p) => Math.min(menuTotalPages, p + 1))
                }
                disabled={menuPage === menuTotalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            COLUMN 3 – Cart & Checkout (25%)
        ════════════════════════════════════════ */}
        <div className="w-[26%] min-w-[240px] flex flex-col border-l border-border bg-white dark:bg-stone-900">
          {/* Cart header */}
          <div className="px-4 py-3 border-b border-border flex-shrink-0 space-y-2.5">
            {selectedTable ? (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-stone-800 dark:text-stone-100">
                    Bàn {selectedTable.tableNumber}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedTable.areaName}
                  </p>
                </div>
                <Badge
                  className={
                    normalizeTableStatus(selectedTable.status) === "available"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs"
                      : normalizeTableStatus(selectedTable.status) ===
                          "outofservice"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-xs"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs"
                  }
                >
                  {getTableStatusLabel(selectedTable.status)}
                </Badge>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground">
                  Chưa chọn bàn
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click vào một bàn để bắt đầu
                </p>
              </div>
            )}
          </div>

          {/* Cart items */}
          <ScrollArea className="flex-1 min-h-0">
            {tableDetailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : !selectedTable ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-3">
                  <Receipt className="w-7 h-7 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chưa chọn bàn
                </p>
              </div>
            ) : cart.length === 0 &&
              (!tableDetail || tableDetail.orders.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-3">
                  <UtensilsCrossed className="w-7 h-7 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chưa có món
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAddingItemsMode
                    ? "Chọn món ở cột bên trái để thêm vào giỏ"
                    : "Nhấn Mở menu gọi món để chọn món"}
                </p>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-2">
                {cart.length > 0 && (
                  <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Món thêm trong order hiện tại
                  </p>
                )}

                {cart.length === 0 && activeOrderItems.length > 0 && (
                  <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Món trong order hiện tại
                  </p>
                )}

                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {item.menuItem.name}
                      </p>
                      <p className="text-xs text-orange-600 font-bold">
                        {formatCurrency(item.menuItem.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() =>
                          updateQty(item.menuItem.id, item.quantity - 1)
                        }
                        className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.menuItem.id, item.quantity + 1)
                        }
                        className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 &&
                  activeOrderItems.map((item, index) => {
                    const imageUrl = menuItemById.get(item.productId)?.image;

                    return (
                      <div
                        key={item.id || `${item.productId}-${index}`}
                        className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-border"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border/50 bg-muted flex items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.productName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-orange-600 font-bold">
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold">x{item.quantity}</p>
                          <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {selectedTable && (
            <div className="border-t border-border px-4 py-3 flex-shrink-0 space-y-3">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tổng cộng
                  {displayItemCount > 0 && (
                    <span className="ml-1 text-xs">
                      ({displayItemCount} món)
                    </span>
                  )}
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(displayTotal)}
                </span>
              </div>

              {saveOrderError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                  {saveOrderError}
                </div>
              )}

              {/* Save order */}
              <Button
                variant="outline"
                className="w-full text-sm h-9"
                disabled={
                  isSavingOrder ||
                  normalizeTableStatus(selectedTable.status) === "outofservice"
                }
                onClick={() => {
                  if (cart.length === 0) {
                    setIsAddingItemsMode(true);
                    return;
                  }

                  handleSaveOrder();
                }}
              >
                {isSavingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ĐANG LƯU...
                  </>
                ) : cart.length === 0 ? (
                  "GỌI MÓN"
                ) : (
                  "LƯU THÊM MÓN"
                )}
              </Button>

              {/* Checkout */}
              {!shouldHideCheckoutButton && (
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm h-10 font-semibold"
                  disabled={!activeOrder && cart.length === 0}
                  onClick={handleCreateBillAndPayment}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  TẠO HÓA ĐƠN &amp; THANH TOÁN
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════ PAYMENT MODAL ════════════════ */}
      <Dialog open={showPaymentModal} onOpenChange={handleClosePaymentModal}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col w-[95vw]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-600" />
              {paymentSuccess
                ? "Thanh toán thành công"
                : "Tạo hóa đơn & Thanh toán"}
            </DialogTitle>
            <DialogDescription>
              {selectedTable
                ? `Bàn ${selectedTable.tableNumber} — ${selectedTable.areaName}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5">
              {/* ── Success screen ── */}
              {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-600 mb-1">
                      Thanh toán thành công!
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Hóa đơn đã được xử lý.{" "}
                      {selectedTable
                        ? `Bàn ${selectedTable.tableNumber} đã được giải phóng.`
                        : ""}
                    </p>
                  </div>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
                    onClick={handleClosePaymentModal}
                  >
                    Xong
                  </Button>
                </div>
              ) : paymentLinkData ? (
                /* ── QR Transfer info ── */
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Mở app ngân hàng bất kỳ để quét VietQR hoặc chuyển khoản
                    đúng nội dung bên dưới.
                  </p>

                  <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] items-start">
                    {/* QR Code */}
                    <div className="mt-12 border rounded-2xl p-1 bg-white w-[240px] h-[240px] mx-auto flex-shrink-0 flex items-center justify-center">
                      {paymentQrImageUrl ? (
                        <Image
                          src={paymentQrImageUrl}
                          alt="VietQR thanh toan"
                          width={230}
                          height={230}
                          className="w-[230px] h-[230px] rounded-lg object-contain object-center"
                        />
                      ) : (
                        <div className="w-[230px] h-[230px] rounded-lg bg-muted" />
                      )}
                    </div>

                    {/* Bank info */}
                    <div className="space-y-3">
                      {/* Bank logo + name */}
                      <div className="flex items-center gap-3">
                        {selectedBank?.logo ? (
                          <Image
                            src={selectedBank.logo}
                            alt={selectedBank.shortName || "Bank"}
                            width={80}
                            height={80}
                            className="rounded-lg border bg-white object-contain"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted border" />
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Ngân hàng
                          </p>
                          <p className="font-semibold text-sm">
                            {selectedBank?.name || `BIN ${paymentLinkData.bin}`}
                          </p>
                        </div>
                      </div>
                      {/* Account name */}
                      <div className="border rounded-xl p-2.5 bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                          Chủ tài khoản
                        </p>
                        <p className="font-semibold text-sm">
                          {paymentLinkData.accountName}
                        </p>
                      </div>

                      {/* Account number */}
                      <div className="flex items-center justify-between gap-2 border rounded-xl p-2.5 bg-muted/20">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Số tài khoản
                          </p>
                          <p className="font-semibold text-sm truncate">
                            {paymentLinkData.accountNumber}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="rounded-lg h-7 text-xs px-2.5 flex-shrink-0"
                          onClick={() =>
                            copyValue(
                              "accountNumber",
                              paymentLinkData.accountNumber,
                            )
                          }
                        >
                          {copiedField === "accountNumber" ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Đã chép
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Sao chép
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center justify-between gap-2 border rounded-xl p-2.5 bg-muted/20">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Số tiền
                          </p>
                          <p className="font-semibold text-sm">
                            {formatCurrency(paymentLinkData.amount)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="rounded-lg h-7 text-xs px-2.5 flex-shrink-0"
                          onClick={() =>
                            copyValue(
                              "amount",
                              paymentLinkData.amount.toString(),
                            )
                          }
                        >
                          {copiedField === "amount" ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Đã chép
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Sao chép
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Description */}
                      <div className="flex items-center justify-between gap-2 border rounded-xl p-2.5 bg-muted/20">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Nội dung
                          </p>
                          <p className="font-semibold text-sm break-all">
                            {paymentLinkData.description}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="rounded-lg h-7 text-xs px-2.5 flex-shrink-0"
                          onClick={() =>
                            copyValue(
                              "description",
                              paymentLinkData.description,
                            )
                          }
                        >
                          {copiedField === "description" ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Đã chép
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Sao chép
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isAwaitingTransferConfirmation && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-3">
                      <p className="flex items-center gap-2 text-sm font-medium text-orange-700">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang chờ xác nhận thanh toán thành công...
                      </p>
                    </div>
                  )}

                  {/* Amber note */}
                  <div className="rounded-lg border border-amber-200/55 bg-amber-50/45 px-4 py-2">
                    <p className="text-sm text-amber-800/90 leading-snug">
                      Lưu ý: Vui lòng nhập chính xác số tiền và nội dung chuyển
                      khoản để hệ thống tự động đối soát.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    onClick={handleMarkTransferDone}
                    disabled={isAwaitingTransferConfirmation}
                  >
                    {isAwaitingTransferConfirmation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang chờ xác nhận...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Đã nhận thanh toán thành công.
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                /* ── Normal payment form ── */
                <div className="space-y-5">
                  {/* Order summary */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <p className="text-sm font-semibold mb-3">
                      Tóm tắt đơn hàng
                    </p>
                    {paymentSummaryItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có món trong order.
                      </p>
                    ) : (
                      paymentSummaryItems.map((item) => (
                        <div
                          key={item.key}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Tổng cộng</span>
                      <span className="text-orange-600">
                        {formatCurrency(paymentSummaryTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Phương thức thanh toán
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          value: "cash" as PaymentMethod,
                          label: "Tiền mặt",
                          icon: <Banknote className="w-5 h-5" />,
                        },
                        {
                          value: "bank" as PaymentMethod,
                          label: "Chuyển khoản QR",
                          icon: <CreditCard className="w-5 h-5" />,
                        },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPaymentMethod(opt.value)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === opt.value
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
                              : "border-border bg-muted/20 text-muted-foreground hover:border-orange-300"
                          }`}
                        >
                          {opt.icon}
                          <span className="text-sm font-medium">
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash given input */}
                  {paymentMethod === "cash" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Tiền khách đưa (VNĐ)
                        </label>
                        <Input
                          type="number"
                          value={cashGiven}
                          onChange={(e) => setCashGiven(e.target.value)}
                          placeholder="Nhập số tiền..."
                          className="rounded-xl text-base"
                          min={0}
                        />
                      </div>
                      {cashGiven && (
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            cashChange >= 0
                              ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"
                              : "border-destructive/30 bg-destructive/10"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            Tiền thối lại
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              cashChange >= 0
                                ? "text-emerald-600"
                                : "text-destructive"
                            }`}
                          >
                            {cashChange >= 0
                              ? formatCurrency(cashChange)
                              : "Thiếu " + formatCurrency(Math.abs(cashChange))}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirm button */}
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 text-base font-semibold"
                    onClick={handleConfirmPayment}
                    disabled={
                      isCheckingPaymentInfo ||
                      isCreatingBill ||
                      isCreatingLink ||
                      (paymentMethod === "cash" && cashChange < 0) ||
                      !activeOrder
                    }
                  >
                    {isCheckingPaymentInfo ||
                    isCreatingBill ||
                    isCreatingLink ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isCheckingPaymentInfo
                          ? "Đang kiểm tra thanh toán..."
                          : isCreatingBill
                            ? "Đang tạo hóa đơn..."
                            : "Đang tạo mã QR..."}
                      </>
                    ) : (
                      "Xác nhận Thanh toán"
                    )}
                  </Button>

                  {!activeOrder && (
                    <p className="text-xs text-center text-muted-foreground">
                      Bàn này chưa có order. Hãy lưu món trước khi thanh toán.
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────────────── MenuCard ─────────────────────── */

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="group text-left rounded-lg border border-border bg-white dark:bg-stone-900 overflow-hidden hover:border-orange-400 hover:shadow-md hover:shadow-orange-100/50 dark:hover:shadow-orange-900/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
    >
      <div className="h-32 overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
        <Image
          src={item.image}
          alt={item.name}
          width={200}
          height={128}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-md">
          <Plus className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[15px] font-semibold text-stone-800 dark:text-stone-100 leading-tight line-clamp-2 mb-1">
          {item.name}
        </p>
        <p className="text-base font-bold text-orange-600">
          {formatCurrency(item.price)}
        </p>
      </div>
    </button>
  );
}

/* ─────────────────────── TableFloorPlan ─────────────────────── */

function Chair({
  horizontal,
  occupied,
}: {
  horizontal: boolean;
  occupied: boolean;
}) {
  const base = "rounded flex-shrink-0 transition-colors";
  const size = horizontal ? "w-6 h-3.5" : "w-3.5 h-6";
  const color = occupied
    ? "bg-orange-500 dark:bg-orange-500"
    : "bg-stone-200 dark:bg-stone-600";
  return <div className={`${base} ${size} ${color}`} />;
}

function TableFloorPlan({
  capacity,
  status,
  isSelected,
  tableNumber,
}: {
  capacity: number;
  status: string;
  isSelected: boolean;
  tableNumber: string;
}) {
  const normalizedStatus = normalizeTableStatus(status);
  const isOccupied = normalizedStatus === "occupied";
  const isReserved = normalizedStatus === "reserved";

  // Chair counts
  const topCols = capacity >= 6 ? 2 : 1;
  const bottomCols = capacity >= 6 ? 2 : 1;
  const hasSideChairs = capacity > 2;

  // Table surface colors
  const tableBg = isOccupied
    ? "bg-orange-600 border-orange-700 shadow-lg shadow-orange-400/30"
    : isReserved
      ? "bg-amber-500 border-amber-600 shadow-lg shadow-amber-400/30"
      : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600";

  const tableText =
    isOccupied || isReserved
      ? "text-white font-bold"
      : "text-stone-700 dark:text-stone-200 font-bold";

  const capacityText =
    isOccupied || isReserved
      ? "text-white/70"
      : "text-stone-400 dark:text-stone-500";

  return (
    <div className="flex flex-col items-center gap-0.5 select-none transition-all">
      {/* Top chairs */}
      <div className="flex gap-1 mb-0.5">
        {Array.from({ length: topCols }).map((_, i) => (
          <Chair key={i} horizontal occupied={isOccupied || isReserved} />
        ))}
      </div>

      {/* Middle row */}
      <div className="flex items-center gap-0.5">
        {hasSideChairs && (
          <div className="mr-0.5">
            <Chair horizontal={false} occupied={isOccupied || isReserved} />
          </div>
        )}

        {/* Table surface */}
        <div
          className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-colors ${
            tableBg
          } ${isSelected ? "ring-[3px] ring-orange-400" : ""}`}
        >
          <span className={`text-base leading-tight ${tableText}`}>
            {tableNumber}
          </span>
        </div>

        {hasSideChairs && (
          <div className="ml-0.5">
            <Chair horizontal={false} occupied={isOccupied || isReserved} />
          </div>
        )}
      </div>

      {/* Bottom chairs */}
      <div className="flex gap-1 mt-0.5">
        {Array.from({ length: bottomCols }).map((_, i) => (
          <Chair key={i} horizontal occupied={isOccupied || isReserved} />
        ))}
      </div>
    </div>
  );
}
