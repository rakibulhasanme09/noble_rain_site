import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import InvoicePage from './pages/InvoicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { AuthProvider } from './context/AuthContext';

function App() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <Router>
      <Header ref={headerRef} />
      <div style={{ height: headerHeight }} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage headerHeight={headerHeight} />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/invoice/:id" element={<InvoicePage />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" theme="dark" />
    </Router>
  );
}

export default App;
