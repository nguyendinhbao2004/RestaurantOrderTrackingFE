"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, MenuItem, Order, OrderStatus } from '@/types';

interface OrderContextType {
    cart: CartItem[];
    orders: Order[];
    selectedTable: string | null;
    addToCart: (item: MenuItem, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateCartQuantity: (itemId: string, quantity: number) => void;
    /** Add one empty note slot (up to item.quantity). */
    addCartNote: (itemId: string) => void;
    /** Update the note text at a given index. */
    updateCartNote: (itemId: string, index: number, note: string) => void;
    /** Remove the note at a given index. */
    removeCartNote: (itemId: string, index: number) => void;
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

    const addToCart = useCallback((item: MenuItem, quantity: number = 1) => {
        setCart((prevCart) => {
            const existing = prevCart.find((c) => c.menuItem.id === item.id);
            if (existing) {
                return prevCart.map((c) =>
                    c.menuItem.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
                );
            }
            return [...prevCart, { menuItem: item, quantity, notes: [] }];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
    }, []);

    const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) { removeFromCart(itemId); return; }
        setCart((prev) =>
            prev.map((c) => {
                if (c.menuItem.id !== itemId) return c;
                // Trim excess notes when quantity decreases
                const notes = c.notes.slice(0, quantity);
                return { ...c, quantity, notes };
            })
        );
    }, [removeFromCart]);

    const addCartNote = useCallback((itemId: string) => {
        setCart((prev) =>
            prev.map((c) => {
                if (c.menuItem.id !== itemId) return c;
                if (c.notes.length >= c.quantity) return c; // cap at quantity
                return { ...c, notes: [...c.notes, ""] };
            })
        );
    }, []);

    const updateCartNote = useCallback((itemId: string, index: number, note: string) => {
        setCart((prev) =>
            prev.map((c) => {
                if (c.menuItem.id !== itemId) return c;
                const notes = [...c.notes];
                notes[index] = note;
                return { ...c, notes };
            })
        );
    }, []);

    const removeCartNote = useCallback((itemId: string, index: number) => {
        setCart((prev) =>
            prev.map((c) => {
                if (c.menuItem.id !== itemId) return c;
                const notes = c.notes.filter((_, i) => i !== index);
                return { ...c, notes };
            })
        );
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const getCartTotal = useCallback(() =>
        cart.reduce((total, c) => total + c.menuItem.price * c.quantity, 0), [cart]);

    const getCartItemCount = useCallback(() =>
        cart.reduce((count, c) => count + c.quantity, 0), [cart]);

    const placeOrder = useCallback(() => {
        if (!selectedTable || cart.length === 0) return null;
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            tableId: selectedTable,
            items: cart.map((c) => ({
                menuItem: c.menuItem,
                quantity: c.quantity,
                notes: c.notes.filter(Boolean).join(", "),
            })),
            status: 'pending',
            totalAmount: getCartTotal(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setOrders((prev) => [...prev, newOrder]);
        clearCart();
        return newOrder;
    }, [selectedTable, cart, getCartTotal, clearCart]);

    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
        setOrders((prev) => prev.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
        ));
    }, []);

    return (
        <OrderContext.Provider value={{
            cart, orders, selectedTable,
            addToCart, removeFromCart, updateCartQuantity,
            addCartNote, updateCartNote, removeCartNote,
            clearCart, setSelectedTable, placeOrder, updateOrderStatus,
            getCartTotal, getCartItemCount,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrder must be used within an OrderProvider');
    return context;
}
