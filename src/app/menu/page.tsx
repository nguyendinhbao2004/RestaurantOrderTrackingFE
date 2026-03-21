"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  ShoppingBag,
  LogIn,
  LogOut,
  ArrowRight,
  Clock,
  Star,
  User,
  Phone,
  MapPin,
  FileText,
  Banknote,
  CreditCard,
  Wallet,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { MenuItem, Category } from "@/types";
import { useOrder } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBanks } from "@/contexts/BanksContext";
import { fetchProducts } from "@/services/product.service";
import { fetchCategories } from "@/services/category.service";
import { fetchCustomerByAccountId } from "@/services/customer.service";
import { ApiPaymentMethod, PaymentLinkData, buildVietQrImageUrl, createOnlineOrder, createPaymentLink,} from "@/services/online-order.service";
import { mapProductsToMenuItems, formatCurrency } from "@/lib/helpers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePaymentSuccessSignalR, type PaymentMessage,} from "@/hooks/usePaymentSuccessSignalR";

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

type PaymentMethod = "cod" | "bank" | "ewallet";
type CheckoutStep = "delivery" | "payment" | "confirm" | "success";
type CopyField = "accountNumber" | "amount" | "description";

const PAYMENT_METHOD_TO_API_VALUE: Record<PaymentMethod, ApiPaymentMethod> = {
  cod: ApiPaymentMethod.cash,
  ewallet: ApiPaymentMethod.credit_card,
  bank: ApiPaymentMethod.bank_transfer,
};

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

export default function MenuPage() {
  /* ─── Product state ─── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 12;

  /* ─── Cart + Checkout UI ─── */
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("delivery");
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderId, setOrderId] = useState<string>("");
  const [orderCode, setOrderCode] = useState<number>(0);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentLinkData, setPaymentLinkData] = useState<PaymentLinkData | null>(null);
  const [billId, setBillId] = useState<string>("");
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const [isAwaitingPaymentConfirmation, setIsAwaitingPaymentConfirmation] = useState(false);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart,
  } = useOrder();

  const { isAuthenticated, logout, user } = useAuth();
  const { findBankByBin } = useBanks();

  const selectedBank = useMemo(() => {
    if (!paymentLinkData?.bin) return undefined;
    return findBankByBin(paymentLinkData.bin);
  }, [findBankByBin, paymentLinkData]);

  const paymentQrImageUrl = useMemo(() => {
    if (!paymentLinkData) return null;
    return buildVietQrImageUrl(paymentLinkData);
  }, [paymentLinkData]);

  /* ─── Fetch products ─── */
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchProducts({ pageIndex, pageSize: PAGE_SIZE });
      setMenuItems(mapProductsToMenuItems(response.data));
      const pagination = response.meta?.pagination;
      if (pagination) setTotalPages(pagination.totalPages);
    } catch {
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /* ─── Fetch categories ─── */
  useEffect(() => {
    fetchCategories()
      .then((res) => setApiCategories(res.data))
      .catch(() => {});
  }, []);

  /* ─── Categories ─── */
  const categories = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      ...apiCategories
        .filter((c) => c.isActive)
        .map((c) => ({ value: c.name, label: c.name })),
    ],
    [apiCategories],
  );

  /* ─── Filtered items ─── */
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

  const resetCheckoutState = useCallback(() => {
    setCheckoutStep("delivery");
    setDeliveryInfo({ name: "", phone: "", address: "", notes: "" });
    setPaymentMethod("cod");
    setOrderId("");
    setOrderCode(0);
    setCheckoutError(null);
    setPaymentLinkData(null);
    setBillId("");
    setCopiedField(null);
    setIsAwaitingPaymentConfirmation(false);
    setIsSubmittingOrder(false);
    setIsCreatingPaymentLink(false);
  }, []);

  const handleStartCheckout = async () => {
    try {
      setIsLoadingCheckout(true);
      setCheckoutError(null);
      setPaymentLinkData(null);
      setBillId("");
      setCopiedField(null);
      setOrderCode(0);
      setIsAwaitingPaymentConfirmation(false);

      if (user?.id) {
        const response = await fetchCustomerByAccountId(user.id);
        if (response.succeeded && response.data) {
          setDeliveryInfo({
            name: response.data.name || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            notes: "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching customer info:", err);
    } finally {
      setIsLoadingCheckout(false);
      setCheckoutStep("delivery");
      setShowCheckout(true);
      setShowCart(false);
    }
  };

  const handleCreatePaymentLink = useCallback(async (currentBillId: string) => {
    setIsCreatingPaymentLink(true);
    setCheckoutError(null);
    setIsAwaitingPaymentConfirmation(false);

    try {
      const paymentResponse = await createPaymentLink({ billId: currentBillId });
      setPaymentLinkData(paymentResponse.data);
      setOrderCode(paymentResponse.data.orderCode || 0);
    } catch (error) {
      setCheckoutError(
        getApiErrorMessage(
          error,
          "Không thể tạo mã QR thanh toán. Vui lòng thử lại.",
        ),
      );
    } finally {
      setIsCreatingPaymentLink(false);
    }
  }, []);

  const handleSubmitOnlineOrder = useCallback(async () => {
    if (cart.length === 0) {
      setCheckoutError("Giỏ hàng trống. Vui lòng chọn món trước khi thanh toán.");
      return;
    }

    setIsSubmittingOrder(true);
    setCheckoutError(null);
    setIsAwaitingPaymentConfirmation(false);

    try {
      const response = await createOnlineOrder({
        customerName: deliveryInfo.name.trim(),
        customerPhone: deliveryInfo.phone.trim(),
        customerAddress: deliveryInfo.address.trim(),
        paymentMethod: PAYMENT_METHOD_TO_API_VALUE[paymentMethod],
        items: cart.map((item) => ({
          productId: item.menuItem.id,
          note: item.notes?.trim() || "",
          quantity: item.quantity,
        })),
      });

      setOrderId(response.data.orderId);
      setBillId(response.data.billId);
      clearCart();

      if (response.data.paymentMethod === ApiPaymentMethod.bank_transfer) {
        setCheckoutStep("confirm");
        await handleCreatePaymentLink(response.data.billId);
        return;
      }

      setIsAwaitingPaymentConfirmation(false);
      setCheckoutStep("success");
    } catch (error) {
      setCheckoutError(
        getApiErrorMessage(error, "Không thể tạo đơn online. Vui lòng thử lại."),
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [
    cart,
    clearCart,
    deliveryInfo.address,
    deliveryInfo.name,
    deliveryInfo.phone,
    handleCreatePaymentLink,
    paymentMethod,
  ]);

  const handleCloseCheckout = (open: boolean) => {
    setShowCheckout(open);
    if (!open) resetCheckoutState();
  };

  const handleCopyTransferValue = async (field: CopyField, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1500);
    } catch {
      setCheckoutError("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  const handlePaymentSuccessMessage = useCallback(
    (message: PaymentMessage) => {
      const incomingOrderId = message.orderId.trim();
      const incomingOrderCode =
        Number.isFinite(message.orderCode) && message.orderCode > 0
          ? Math.trunc(message.orderCode)
          : 0;

      const targetOrderId = orderId.trim();
      const targetOrderCode =
        orderCode > 0
          ? orderCode
          : paymentLinkData?.orderCode
            ? Math.trunc(paymentLinkData.orderCode)
            : 0;

      const isMatchedByOrderId =
        !!incomingOrderId && !!targetOrderId && incomingOrderId === targetOrderId;
      const isMatchedByOrderCode =
        incomingOrderCode > 0 &&
        targetOrderCode > 0 &&
        incomingOrderCode === targetOrderCode;

      if (!isMatchedByOrderId && !isMatchedByOrderCode) return;

      setCheckoutError(null);
      setIsAwaitingPaymentConfirmation(false);
      setCheckoutStep("success");
      setShowCheckout(true);
    },
    [orderCode, orderId, paymentLinkData?.orderCode],
  );

  const paymentSignalROrderCodes = useMemo(() => {
    const code = orderCode > 0 ? Math.trunc(orderCode) : 0;

    return code > 0 ? [code] : [];
  }, [orderCode]);

  usePaymentSuccessSignalR(handlePaymentSuccessMessage, {
    enabled:
      paymentMethod === "bank" &&
      checkoutStep === "confirm" &&
      paymentSignalROrderCodes.length > 0,
    subscribeOrderCodes: paymentSignalROrderCodes,
  });

  const isDeliveryValid = Boolean(
    deliveryInfo.name.trim() &&
      deliveryInfo.phone.trim() &&
      deliveryInfo.address.trim(),
  );

  const paymentOptions: {
    value: PaymentMethod;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "cod",
      label: "Thanh toán khi nhận hàng",
      desc: "Thanh toán khi bạn nhận được đơn hàng",
      icon: <Banknote className="w-5 h-5" />,
    },
    {
      value: "bank",
      label: "Chuyển khoản ngân hàng",
      desc: "Chuyển khoản vào tài khoản ngân hàng",
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-orange-950/20">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/60 backdrop-blur-xl shadow-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white font-bold text-base">R</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-orange-600 hidden sm:inline">
                Restaurant
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-border/50 bg-muted/50 focus:bg-background"
              />
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="relative rounded-full px-4"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>

              {!isAuthenticated ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 text-sm hidden sm:flex"
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Đăng nhập
                  </Link>
                </Button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-8 w-8 border-2 border-orange-200 dark:border-orange-800">
                      <AvatarFallback className="bg-orange-500 text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold leading-none">
                      {user?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-orange-600">Thực đơn</span>
          </h1>
          <p className="text-muted-foreground">
            Duyệt thực đơn và chọn món yêu thích.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mb-4" />
            <p className="text-muted-foreground">Đang tải thực đơn...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">
                    Lỗi tải dữ liệu
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    variant="outline"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {!isLoading && !error && (
          <>
            {/* Category Tabs */}
            <Tabs
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v)}
            >
              <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-full px-5 py-2"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Không tìm thấy món ăn
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Thử danh mục hoặc từ khóa khác
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onAdd={() => addToCart(item)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  disabled={pageIndex === 1}
                  className="h-9 w-9 p-0 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === pageIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPageIndex(page)}
                      className={`h-9 w-9 p-0 rounded-full ${
                        page === pageIndex
                          ? "bg-orange-600 text-white border-0"
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={pageIndex === totalPages}
                  className="h-9 w-9 p-0 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Floating Cart Button ─── */}
      {getCartItemCount() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden bg-orange-600 text-white rounded-full px-6 py-3.5 shadow-2xl shadow-orange-500/40 flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{getCartItemCount()} món</span>
          <Separator orientation="vertical" className="h-5 bg-white/30" />
          <span className="font-bold">{formatCurrency(getCartTotal())}</span>
        </button>
      )}

      {/* ─── Cart Drawer ─── */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              Giỏ hàng
              {getCartItemCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                >
                  {getCartItemCount()} món
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Xem lại các món trước khi thanh toán
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">
                Giỏ hàng trống
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Thêm món ăn ngon nào!
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => setShowCart(false)}
              >
                Xem thực đơn
              </Button>
            </div>
          ) : (
            <div className="flex flex-col min-h-0 flex-1">
              <ScrollArea className="flex-1 px-6 overflow-y-auto">
                <div className="py-4 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-sm text-orange-600 font-semibold">
                          {formatCurrency(item.menuItem.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() =>
                            updateCartQuantity(
                              item.menuItem.id,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() =>
                            updateCartQuantity(
                              item.menuItem.id,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive rounded-full"
                          onClick={() => removeFromCart(item.menuItem.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(getCartTotal())}
                  </span>
                </div>

                <Button
                  onClick={() => void handleStartCheckout()}
                  disabled={isLoadingCheckout}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full py-5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tải thông tin...
                    </>
                  ) : (
                    <>
                      Tiến hành đặt hàng
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Checkout Dialog ─── */}
      <Dialog open={showCheckout} onOpenChange={handleCloseCheckout}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl p-0 gap-0 max-h-[90vh] flex flex-col w-[95vw]">
          {checkoutStep !== "success" && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle>Thanh toán</DialogTitle>
                <DialogDescription>
                  {checkoutStep === "delivery" && "Nhập thông tin giao hàng"}
                  {checkoutStep === "payment" && "Chọn phương thức thanh toán"}
                  {checkoutStep === "confirm" &&
                    "Quét mã QR để hoàn tất chuyển khoản"}
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 pb-4">
                <div className="flex items-center">
                  {(["delivery", "payment", "confirm"] as CheckoutStep[]).map(
                    (step, i) => {
                      const currentIdx = ["delivery", "payment", "confirm"].indexOf(
                        checkoutStep,
                      );
                      const isActive = checkoutStep === step;
                      const isDone = i < currentIdx;

                      return (
                        <div
                          key={step}
                          className="flex items-center flex-1 last:flex-none"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                isActive
                                  ? "bg-orange-600 text-white"
                                  : isDone
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {i + 1}
                            </div>
                            <span
                              className={`text-[10px] font-medium whitespace-nowrap ${
                                isActive
                                  ? "text-orange-600"
                                  : isDone
                                    ? "text-orange-400"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {step === "delivery"
                                ? "Giao hàng"
                                : step === "payment"
                                  ? "Thanh toán"
                                  : "Xác nhận"}
                            </span>
                          </div>
                          {i < 2 && (
                            <div
                              className={`flex-1 h-0.5 mx-2 mb-4 rounded ${
                                i < currentIdx ? "bg-orange-400" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {checkoutStep === "confirm" && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex-shrink-0">
                <p className="text-sm text-muted-foreground">
                  Mở app ngân hàng bất kỳ để quét VietQR hoặc chuyển khoản đúng nội dung bên dưới.
                </p>
              </div>

              {isAwaitingPaymentConfirmation && (
                <div className="mx-5 mb-3 rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-orange-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang chờ server xác nhận thanh toán thành công...
                  </p>
                </div>
              )}

              {isCreatingPaymentLink ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 pb-6">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                  <p className="font-semibold text-center">
                    Đang tạo mã QR thanh toán...
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Vui lòng chờ trong giây lát.
                  </p>
                </div>
              ) : paymentLinkData ? (
                <>
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="px-5 pb-4 space-y-4">
                      <div className="grid gap-6 md:grid-cols-[260px_minmax(0,400px)] justify-center">
                        <div className="mt-10 border rounded-2xl p-1 bg-white w-[260px] h-[260px] mx-auto md:mx-0 flex-shrink-0 flex items-center justify-center">
                          {paymentQrImageUrl ? (
                            <Image
                              src={paymentQrImageUrl}
                              alt="VietQR thanh toan"
                              width={250}
                              height={250}
                              className="w-[250px] h-[250px] rounded-lg object-contain object-center"
                            />
                          ) : (
                            <div className="w-[250px] h-[250px] rounded-lg bg-muted" />
                          )}
                        </div>

                        <div className="space-y-3 min-w-0">
                          <div className="flex items-center gap-3">
                            {selectedBank?.logo ? (
                              <Image
                                src={selectedBank.logo}
                                alt={selectedBank.shortName || "Bank logo"}
                                width={100}
                                height={100}
                                className="rounded-lg border bg-white object-contain"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-muted border" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">
                                Ngân hàng
                              </p>
                              <p className="font-semibold text-sm truncate">
                                {selectedBank?.name || `BIN ${paymentLinkData.bin}`}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 border rounded-xl p-2.5 bg-muted/20">
                              <div className="min-w-0 pr-2">
                                <p className="text-xs text-muted-foreground">
                                  Chủ tài khoản
                                </p>
                                <p className="font-semibold text-sm truncate">
                                  {paymentLinkData.accountName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border rounded-xl p-2.5 bg-muted/20">
                              <div className="min-w-0 pr-2">
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
                                  void handleCopyTransferValue(
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

                            <div className="flex items-center justify-between gap-3 border rounded-xl p-3">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Số tiền
                                </p>
                                <p className="font-semibold">
                                  {formatCurrency(paymentLinkData.amount)}
                                </p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="rounded-lg"
                                onClick={() =>
                                  void handleCopyTransferValue(
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

                            <div className="flex items-center justify-between gap-3 border rounded-xl p-3">
                              <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">
                                  Nội dung
                                </p>
                                <p className="font-semibold break-all">
                                  {paymentLinkData.description}
                                </p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="rounded-lg"
                                onClick={() =>
                                  void handleCopyTransferValue(
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
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="px-5 pt-1 pb-3 flex-shrink-0">
                    <div className="mx-auto w-fit max-w-full rounded-lg border border-amber-200/55 bg-amber-50/45 px-4 py-2">
                      <p className="text-sm text-amber-800/90 leading-snug">
                        Lưu ý: Vui lòng nhập chính xác số tiền và nội dung chuyển
                        khoản để hệ thống tự động đối soát.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 pb-8 text-center">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                  <p className="font-semibold">
                    Không thể hiển thị mã QR thanh toán
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {checkoutError || "Bạn có thể thử tạo lại mã QR hoặc quay lại sau."}
                  </p>
                </div>
              )}
            </div>
          )}

          {checkoutStep !== "confirm" && (
            <ScrollArea className="flex-1">
              <div className="px-6 py-6">
                {checkoutError && (
                  <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {checkoutError}
                  </div>
                )}

                {checkoutStep === "delivery" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-500" />
                        Họ và tên *
                      </label>
                      <Input
                        value={deliveryInfo.name}
                        onChange={(e) =>
                          setDeliveryInfo((d) => ({ ...d, name: e.target.value }))
                        }
                        placeholder="Nhập họ và tên"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-orange-500" />
                        Số điện thoại *
                      </label>
                      <Input
                        value={deliveryInfo.phone}
                        onChange={(e) =>
                          setDeliveryInfo((d) => ({
                            ...d,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Nhập số điện thoại"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        Địa chỉ giao hàng *
                      </label>
                      <Input
                        value={deliveryInfo.address}
                        onChange={(e) =>
                          setDeliveryInfo((d) => ({
                            ...d,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Nhập số nhà, tên đường..."
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-orange-500" />
                        Ghi chú (tùy chọn)
                      </label>
                      <Input
                        value={deliveryInfo.notes}
                        onChange={(e) =>
                          setDeliveryInfo((d) => ({
                            ...d,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Hướng dẫn đặc biệt, số tầng, v.v."
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {checkoutStep === "payment" && (
                  <div className="space-y-3">
                    {paymentOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          paymentMethod === opt.value
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : "border-border/50 hover:border-orange-200"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            paymentMethod === opt.value
                              ? "bg-orange-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {opt.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === opt.value
                              ? "border-orange-500"
                              : "border-border"
                          }`}
                        >
                          {paymentMethod === opt.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      Đặt hàng thành công!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Đơn hàng của bạn đã được gửi thành công
                    </p>

                    <div className="bg-muted/50 rounded-2xl p-5 text-left space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mã đơn hàng</span>
                        <span className="font-mono font-bold">{orderId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Dự kiến giao
                        </span>
                        <span className="font-semibold">30–45 phút</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Thanh toán</span>
                        <span className="font-medium">
                          {paymentOptions.find((o) => o.value === paymentMethod)
                            ?.label}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCloseCheckout(false)}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {checkoutStep !== "success" && (
            <div className="flex-shrink-0 bg-background border-t border-border/50">
              <div className="px-6 py-4 flex gap-3">
                {checkoutStep === "payment" && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setCheckoutStep("delivery")}
                    disabled={isSubmittingOrder || isCreatingPaymentLink}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Quay lại
                  </Button>
                )}

                {checkoutStep === "confirm" && !paymentLinkData && billId && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => void handleCreatePaymentLink(billId)}
                    disabled={isCreatingPaymentLink || isSubmittingOrder}
                  >
                    Tạo lại mã QR
                  </Button>
                )}

                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                  disabled={
                    (checkoutStep === "delivery" && !isDeliveryValid) ||
                    isSubmittingOrder ||
                    isCreatingPaymentLink ||
                    (checkoutStep === "confirm" &&
                      (!paymentLinkData || isAwaitingPaymentConfirmation))
                  }
                  onClick={() => {
                    if (checkoutStep === "delivery") setCheckoutStep("payment");
                    else if (checkoutStep === "payment")
                      void handleSubmitOnlineOrder();
                    else setIsAwaitingPaymentConfirmation(true);
                  }}
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo đơn hàng...
                    </>
                  ) : isCreatingPaymentLink ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo mã QR...
                    </>
                  ) : checkoutStep === "confirm" &&
                    isAwaitingPaymentConfirmation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang chờ xác nhận...
                    </>
                  ) : checkoutStep === "confirm" ? (
                    <>Tôi đã chuyển khoản</>
                  ) : (
                    <>
                      Tiếp tục
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ──────────── Product Card ──────────── */

function ProductCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
            <X className="w-8 h-8 text-white" />
            <Badge
              variant="destructive"
              className="text-sm font-semibold px-3 py-1 bg-red-600 hover:bg-red-600"
            >
              Hết hàng
            </Badge>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 dark:bg-stone-950/70 text-foreground backdrop-blur-sm text-xs">
            {item.categoryName}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {item.preparationTime} phút
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-semibold text-base leading-tight flex-1 pr-2 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(item.price)}
          </span>

          <Button
            onClick={onAdd}
            disabled={!item.isAvailable}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 disabled:bg-stone-400"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, j) => (
            <Star key={j} className="w-3 h-3 text-amber-500 fill-amber-500" />
          ))}
          <span className="text-xs text-muted-foreground ml-1">5.0</span>
        </div>
      </CardContent>
    </Card>
  );
}
