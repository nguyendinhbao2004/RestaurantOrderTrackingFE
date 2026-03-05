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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  MapPin,
  Phone,
  User,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  ShoppingBag,
  LogIn,
  LogOut,
  ArrowRight,
  FileText,
  Clock,
  Star,
} from "lucide-react";
import { MenuItem } from "@/types";
import { useOrder } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProducts } from "@/services/product.service";
import { mapProductsToMenuItems } from "@/lib/helpers";
import { formatCurrency } from "@/lib/helpers";

/* ──────────── types ──────────── */

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

type PaymentMethod = "cod" | "bank" | "ewallet";
type CheckoutStep = "delivery" | "payment" | "confirm" | "success";

/* ──────────── component ──────────── */

export default function CustomerPage() {
  // Product state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 12;

  // Cart UI
  const [showCart, setShowCart] = useState(false);

  // Checkout
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

  // Fetch products
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchProducts({ pageIndex, pageSize: PAGE_SIZE });
      setMenuItems(mapProductsToMenuItems(response.data));
      const pagination = response.meta?.pagination;
      if (pagination) setTotalPages(pagination.totalPages);
    } catch {
      setError("Unable to load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Categories
  const categories = useMemo(() => {
    const names = Array.from(
      new Set(menuItems.map((i) => i.categoryName))
    ).sort();
    return [
      { value: "all", label: "All" },
      ...names.map((n) => ({ value: n, label: n })),
    ];
  }, [menuItems]);

  // Filtered items
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
          i.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  // Checkout handlers
  const handleStartCheckout = () => {
    setCheckoutStep("delivery");
    setShowCheckout(true);
    setShowCart(false);
  };

  const handlePlaceOrder = () => {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);
    setCheckoutStep("success");
    clearCart();
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    if (checkoutStep === "success") {
      setDeliveryInfo({ name: "", phone: "", address: "", notes: "" });
      setPaymentMethod("cod");
      setOrderId("");
    }
  };

  const isDeliveryValid =
    deliveryInfo.name.trim() &&
    deliveryInfo.phone.trim() &&
    deliveryInfo.address.trim();

  const paymentOptions: {
    value: PaymentMethod;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "cod",
      label: "Cash on Delivery",
      desc: "Pay when you receive your order",
      icon: <Banknote className="w-5 h-5" />,
    },
    {
      value: "bank",
      label: "Bank Transfer",
      desc: "Transfer to our bank account",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      value: "ewallet",
      label: "E-Wallet",
      desc: "MoMo, ZaloPay, VNPay",
      icon: <Wallet className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/customer" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white font-bold text-base">R</span>
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent hidden sm:inline">
                Restaurant
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-border/50 bg-muted/50 focus:bg-background"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3 text-sm hidden sm:flex"
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Login
                  </Link>
                </Button>
              ) : (
                <div className="hidden sm:flex items-center gap-3 mr-2">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold leading-none">{user?.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="relative rounded-full px-4"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Cart</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs flex items-center justify-center font-bold">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Order Online
            </span>
          </h1>
          <p className="text-muted-foreground">
            Browse our menu and get your favorite dishes delivered to your door.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-violet-600 mb-4" />
            <p className="text-muted-foreground">Loading menu...</p>
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
                    Error loading data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    variant="outline"
                  >
                    Try Again
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
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-full px-5 py-2"
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
                      No dishes found
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Try a different category or search term
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
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  )
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

      {/* ─── Floating Cart Button (Mobile) ─── */}
      {getCartItemCount() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full px-6 py-3.5 shadow-2xl shadow-violet-500/40 flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{getCartItemCount()} items</span>
          <Separator orientation="vertical" className="h-5 bg-white/30" />
          <span className="font-bold">{formatCurrency(getCartTotal())}</span>
        </button>
      )}

      {/* ─── Cart Drawer ─── */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-violet-600" />
              Your Cart
              {getCartItemCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                >
                  {getCartItemCount()} items
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Review your items before checkout
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">
                Your cart is empty
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Add some delicious dishes!
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => setShowCart(false)}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6">
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
                        <p className="text-sm text-violet-600 font-semibold">
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
                              item.quantity - 1
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
                              item.quantity + 1
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
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-violet-600">
                    {formatCurrency(getCartTotal())}
                  </span>
                </div>
                <Button
                  onClick={handleStartCheckout}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full py-5 text-base"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Checkout Dialog ─── */}
      <Dialog open={showCheckout} onOpenChange={handleCloseCheckout}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col">
          {checkoutStep !== "success" && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle>Checkout</DialogTitle>
                <DialogDescription>
                  {checkoutStep === "delivery" && "Enter your delivery details"}
                  {checkoutStep === "payment" && "Choose your payment method"}
                  {checkoutStep === "confirm" && "Review and confirm your order"}
                </DialogDescription>
              </DialogHeader>

              {/* Progress Steps */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2">
                  {(["delivery", "payment", "confirm"] as CheckoutStep[]).map(
                    (step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                            checkoutStep === step
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                              : i <
                                  ["delivery", "payment", "confirm"].indexOf(
                                    checkoutStep
                                  )
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {i + 1}
                        </div>
                        {i < 2 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 rounded ${
                              i <
                              ["delivery", "payment", "confirm"].indexOf(
                                checkoutStep
                              )
                                ? "bg-violet-400"
                                : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          <ScrollArea className="flex-1">
            <div className="px-6 py-6">
              {/* Step 1: Delivery Info */}
              {checkoutStep === "delivery" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-violet-500" />
                      Full Name *
                    </label>
                    <Input
                      value={deliveryInfo.name}
                      onChange={(e) =>
                        setDeliveryInfo((d) => ({ ...d, name: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-violet-500" />
                      Phone Number *
                    </label>
                    <Input
                      value={deliveryInfo.phone}
                      onChange={(e) =>
                        setDeliveryInfo((d) => ({
                          ...d,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Enter your phone number"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-violet-500" />
                      Delivery Address *
                    </label>
                    <Input
                      value={deliveryInfo.address}
                      onChange={(e) =>
                        setDeliveryInfo((d) => ({
                          ...d,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Enter your delivery address"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-violet-500" />
                      Notes (optional)
                    </label>
                    <Input
                      value={deliveryInfo.notes}
                      onChange={(e) =>
                        setDeliveryInfo((d) => ({
                          ...d,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Special instructions, floor number, etc."
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {checkoutStep === "payment" && (
                <div className="space-y-3">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === opt.value
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                          : "border-border/50 hover:border-violet-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === opt.value
                            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === opt.value
                            ? "border-violet-500"
                            : "border-border"
                        }`}
                      >
                        {paymentMethod === opt.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Confirm */}
              {checkoutStep === "confirm" && (
                <div className="space-y-5">
                  {/* Delivery Summary */}
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-violet-500" />
                      Delivery To
                    </h4>
                    <p className="text-sm">
                      {deliveryInfo.name} · {deliveryInfo.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {deliveryInfo.address}
                    </p>
                    {deliveryInfo.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        Note: {deliveryInfo.notes}
                      </p>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5 mb-2">
                      <CreditCard className="w-4 h-4 text-violet-500" />
                      Payment Method
                    </h4>
                    <p className="text-sm">
                      {
                        paymentOptions.find((o) => o.value === paymentMethod)
                          ?.label
                      }
                    </p>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">
                      Order Items ({getCartItemCount()})
                    </h4>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.menuItem.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              item.menuItem.price * item.quantity
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-violet-600">
                      {formatCurrency(getCartTotal())}
                    </span>
                  </div>
                </div>
              )}

              {/* Success */}
              {checkoutStep === "success" && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your order has been submitted successfully
                  </p>

                  <div className="bg-muted/50 rounded-2xl p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono font-bold">{orderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Est. Delivery
                      </span>
                      <span className="font-semibold">30–45 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium">
                        {
                          paymentOptions.find((o) => o.value === paymentMethod)
                            ?.label
                        }
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCloseCheckout}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full px-8"
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer buttons */}
          {checkoutStep !== "success" && (
            <>
              <Separator />
              <div className="px-6 py-4 flex gap-3">
                {checkoutStep !== "delivery" && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      setCheckoutStep(
                        checkoutStep === "confirm" ? "payment" : "delivery"
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full"
                  disabled={checkoutStep === "delivery" && !isDeliveryValid}
                  onClick={() => {
                    if (checkoutStep === "delivery")
                      setCheckoutStep("payment");
                    else if (checkoutStep === "payment")
                      setCheckoutStep("confirm");
                    else handlePlaceOrder();
                  }}
                >
                  {checkoutStep === "confirm" ? (
                    <>
                      Place Order · {formatCurrency(getCartTotal())}
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ──────────── Product Card ──────────── */

function ProductCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: () => void;
}) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 flex flex-col">
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
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 dark:bg-black/70 text-foreground backdrop-blur-sm text-xs">
            {item.categoryName}
          </Badge>
        </div>

        {/* Prep time */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {item.preparationTime} min
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-semibold text-base leading-tight flex-1 pr-2 group-hover:text-violet-600 transition-colors">
            {item.name}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
              {formatCurrency(item.price)}
            </span>
          </div>

          <Button
            onClick={onAdd}
            disabled={!item.isAvailable}
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full px-4 disabled:from-gray-400 disabled:to-gray-500"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, j) => (
            <Star
              key={j}
              className="w-3 h-3 text-amber-500 fill-amber-500"
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">5.0</span>
        </div>
      </CardContent>
    </Card>
  );
}
