import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ShieldAlert, ClipboardList, Sun, Moon, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MotherflameLogo } from './MotherflameLogo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'motherflame' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-neutral-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <MotherflameLogo size={36} showText={true} textClassName="text-blue-600 font-extrabold" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Catalog
            </Link>

            {user && (
              <>
                <Link to="/orders" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <ClipboardList size={16} />
                  My Orders
                </Link>
                <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1" id="nav-profile-desktop">
                  <User size={16} />
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-blue-700 hover:bg-blue-100/80 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/50">
                    <ShieldAlert size={16} className="text-blue-600" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            <div className="h-4 w-[1px] bg-slate-200" />

            {/* User Account / Auth Actions */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title={`Switch theme (Current: ${theme})`}
              id="theme-toggle-desktop"
            >
              {theme === 'light' && <Sun size={20} className="text-amber-500 animate-pulse" />}
              {theme === 'dark' && <Moon size={20} className="text-indigo-400" />}
              {theme === 'motherflame' && <Flame size={20} className="text-orange-500 animate-bounce" />}
              <span className="text-xs font-extrabold font-mono uppercase tracking-tight hidden lg:inline">
                {theme}
              </span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm shadow-blue-200">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Icons (Cart and Menu) */}
          <div className="flex items-center gap-1 md:hidden">
            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-blue-600 rounded-lg"
            >
              <ShoppingCart size={20} />
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-600 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2.5">
          {/* Mobile Theme Switcher */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Theme</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
              id="theme-toggle-mobile"
            >
              {theme === 'light' && (
                <>
                  <Sun size={16} className="text-amber-500" />
                  <span>Light</span>
                </>
              )}
              {theme === 'dark' && (
                <>
                  <Moon size={16} className="text-indigo-400" />
                  <span>Dark</span>
                </>
              )}
              {theme === 'motherflame' && (
                <>
                  <Flame size={16} className="text-orange-500" />
                  <span>Motherflame</span>
                </>
              )}
            </button>
          </div>

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Catalog
          </Link>

          {user && (
            <>
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                id="nav-profile-mobile"
              >
                Profile
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg"
                >
                  Admin Panel
                </Link>
              )}
            </>
          )}

          <hr className="border-slate-100" />

          {user ? (
            <div className="space-y-2 pt-1">
              <div className="px-3 text-sm text-slate-500 font-medium">
                Signed in as <span className="text-slate-800">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-blue-600 text-white font-medium rounded-lg text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
