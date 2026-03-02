"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, MenuItem, Order, OrderStatus } from '@/types';

interface OrderContextType {
    cart: CartItem[];
    orders: Order[];
    selectedTable: string | null;
    addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
    removeFromCart: (itemId: string) => void;
    updateCartQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    setSelectedTable: (tableId: string | null) => void;
    placeOrder: () => Order | null;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    const addToCart = useCallback((item: MenuItem, quantity: number = 1, notes?: string) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.menuItem.id === item.id);

            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.menuItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            }

            return [...prevCart, { menuItem: item, quantity, notes }];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.menuItem.id !== itemId));
    }, []);

    const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.menuItem.id === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
    }, [cart]);

    const getCartItemCount = useCallback(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    const placeOrder = useCallback(() => {
        if (!selectedTable || cart.length === 0) return null;

        const newOrder: Order = {
            id: `order-${Date.now()}`,
            tableId: selectedTable,
            items: cart.map((item) => ({
                menuItem: item.menuItem,
                quantity: item.quantity,
                notes: item.notes,
            })),
            status: 'pending',
            totalAmount: getCartTotal(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setOrders((prevOrders) => [...prevOrders, newOrder]);
        clearCart();

        return newOrder;
    }, [selectedTable, cart, getCartTotal, clearCart]);

    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId
                    ? { ...order, status, updatedAt: new Date() }
                    : order
            )
        );
    }, []);

    return (
        <OrderContext.Provider
            value={{
                cart,
                orders,
                selectedTable,
                addToCart,
                removeFromCart,
                updateCartQuantity,
                clearCart,
                setSelectedTable,
                placeOrder,
                updateOrderStatus,
                getCartTotal,
                getCartItemCount,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
