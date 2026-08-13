import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
            setCartItems(JSON.parse(localCart));
        }
    }, []);

    const addToCart = (product, qty) => {
        const existItem = cartItems.find((x) => x.product === product._id);

        let newCartItems;
        if (existItem) {
            newCartItems = cartItems.map((x) =>
                x.product === existItem.product ? { ...x, qty: x.qty + qty } : x
            );
        } else {
            const price = product.discountPercentage ? Math.round(product.price * (1 - product.discountPercentage / 100)) : product.price;
            newCartItems = [...cartItems, { 
                product: product._id, 
                name: product.name, 
                image: product.image, 
                price: price, 
                qty 
            }];
        }
        setCartItems(newCartItems);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    };

    const removeFromCart = (id) => {
        const newCartItems = cartItems.filter((x) => x.product !== id);
        setCartItems(newCartItems);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
