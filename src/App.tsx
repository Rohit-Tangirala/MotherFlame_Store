import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import { Navbar } from './components/Navbar';
import { Breadcrumb } from './components/Breadcrumb';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { ManageProducts } from './pages/admin/ManageProducts';
import { ManageOrders } from './pages/admin/ManageOrders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-blue-600 selection:text-white">
            {/* Global Toaster Alerts */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#0f172a',
                  color: '#fff',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#2563eb',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            {/* Navigation Bar */}
            <Navbar />

            {/* Dynamic Breadcrumb Navigation path */}
            <Breadcrumb />

            {/* Side-sliding Shopping Cart Drawer Overlay */}
            <CartDrawer />

            {/* Main Application Routes */}
            <main className="flex-grow pb-16">
              <Routes>
                {/* Public Storefront Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Secure Customer Checkout & History Routes */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />

                {/* Secure Administrative Control Console Routes */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/products" element={<ManageProducts />} />
                <Route path="/admin/orders" element={<ManageOrders />} />

                {/* Catch-all Routing Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Modular Newsletter Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
