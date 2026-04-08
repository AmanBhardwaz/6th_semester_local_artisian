import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface CartItem {
    _id: string;
    title: string;
    price: number;
    image: string;
    artisanName: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem("cart");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Sync to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: any) => {
        setCartItems(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                // Already in cart — increment quantity
                return prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                _id: product._id,
                title: product.title,
                price: product.price,
                image: product.image,
                artisanName: product.artisan?.name || "Unknown Seller",
                quantity: 1,
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item._id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev =>
            prev.map(item => item._id === id ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
