"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MenuCard } from "@/components/order/MenuCard";
import { Cart } from "@/components/order/Cart";
import { TableSelector } from "@/components/order/TableSelector";
import { OrderStatusDisplay } from "@/components/order/OrderStatus";
import { menuItems } from "@/lib/mock-data";
import { MenuCategory, Order } from "@/types";
import { useOrder } from "@/contexts/OrderContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const categories: { value: MenuCategory | "all"; label: string }[] = [
    { value: "all", label: "All Items" },
    { value: "appetizers", label: "Appetizers" },
    { value: "main-courses", label: "Main Courses" },
    { value: "desserts", label: "Desserts" },
    { value: "beverages", label: "Beverages" },
    { value: "specials", label: "Specials" },
];

export default function OrderPage() {
    const [selectedCategory, setSelectedCategory] = useState<
        MenuCategory | "all"
    >("all");
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [showOrderStatus, setShowOrderStatus] = useState(false);
    const { placeOrder } = useOrder();

    const filteredItems =
        selectedCategory === "all"
            ? menuItems
            : menuItems.filter((item) => item.category === selectedCategory);

    const handlePlaceOrder = () => {
        const order = placeOrder();
        if (order) {
            setCurrentOrder(order);
            setShowOrderStatus(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m12 19-7-7 7-7" />
                                        <path d="M19 12H5" />
                                    </svg>
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        Restaurant Menu
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Select your dishes and place an order
                                </p>
                            </div>
                        </div>
                        <TableSelector />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Menu Section */}
                    <div className="flex-1">
                        <Tabs
                            value={selectedCategory}
                            onValueChange={(v) =>
                                setSelectedCategory(v as MenuCategory | "all")
                            }
                        >
                            <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category.value}
                                        value={category.value}
                                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-full px-4"
                                    >
                                        {category.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent value={selectedCategory} className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredItems.map((item) => (
                                        <MenuCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Cart Sidebar */}
                    <aside className="lg:w-80 xl:w-96">
                        <div className="sticky top-24">
                            <Cart onPlaceOrder={handlePlaceOrder} />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Order Status Dialog */}
            <Dialog open={showOrderStatus} onOpenChange={setShowOrderStatus}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Order Placed Successfully!</DialogTitle>
                        <DialogDescription>
                            Your order has been sent to the kitchen. Track its status below.
                        </DialogDescription>
                    </DialogHeader>
                    <OrderStatusDisplay order={currentOrder} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
