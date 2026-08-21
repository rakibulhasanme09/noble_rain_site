import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    // Stores an already-obtained auth payload (e.g. from OTP verification,
    // which returns the same {_id, name, email, isAdmin, token, ...} shape
    // as /api/auth/login) without an extra login round-trip.
    const setAuthData = (data) => {
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    // Merges partial fields (e.g. after a profile update) into the stored user.
    const updateUser = (partialData) => {
        setUser((prev) => {
            const next = { ...prev, ...partialData };
            localStorage.setItem('userInfo', JSON.stringify(next));
            return next;
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setAuthData, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
