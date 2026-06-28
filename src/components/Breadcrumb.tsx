import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Home as HomeIcon, ChevronRight, ShoppingBag, ClipboardList, User, Shield, Package, Lock, UserPlus } from 'lucide-react';
import axios from 'axios';
import { Product } from '../types';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();
  const pathname = location.pathname;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch product category & name if on product detail page
  useEffect(() => {
    if (pathname.startsWith('/product/') && id) {
      setLoading(true);
      axios
        .get(`/api/products/${id}`)
        .then((res) => {
          setProduct(res.data);
        })
        .catch((err) => {
          console.error('Failed to load breadcrumb product details:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setProduct(null);
    }
  }, [pathname, id]);

  // If the user is on the root catalog page, we hide breadcrumbs to keep the visual spacing pristine
  if (pathname === '/' || pathname === '/index.html') {
    return null;
  }

  // Generate breadcrumb items based on the current pathname
  const renderItems = () => {
    const items: Array<{
      label: string | React.ReactNode;
      path?: string;
      icon?: React.ReactNode;
    }> = [
      {
        label: 'Home',
        path: '/',
        icon: <HomeIcon size={14} className="text-slate-400" />,
      },
    ];

    if (pathname.startsWith('/product/') && id) {
      if (loading) {
        items.push(
          {
            label: <span className="h-4 w-16 bg-slate-200 animate-pulse rounded inline-block" />,
          },
          {
            label: <span className="h-4 w-28 bg-slate-200 animate-pulse rounded inline-block" />,
          }
        );
      } else if (product) {
        // Home > Category > Product Name
        if (product.category) {
          items.push({
            label: product.category,
            path: `/?category=${encodeURIComponent(product.category)}`,
          });
        }
        items.push({
          label: product.name,
        });
      } else {
        items.push({
          label: 'Product Details',
        });
      }
    } else if (pathname === '/cart') {
      items.push({
        label: 'Shopping Cart',
        icon: <ShoppingBag size={14} className="text-slate-400" />,
      });
    } else if (pathname === '/login') {
      items.push({
        label: 'Login',
        icon: <Lock size={14} className="text-slate-400" />,
      });
    } else if (pathname === '/register') {
      items.push({
        label: 'Register',
        icon: <UserPlus size={14} className="text-slate-400" />,
      });
    } else if (pathname === '/checkout') {
      items.push({
        label: 'Checkout',
      });
    } else if (pathname === '/orders') {
      items.push({
        label: 'My Orders',
        icon: <ClipboardList size={14} className="text-slate-400" />,
      });
    } else if (pathname === '/profile') {
      items.push({
        label: 'My Profile',
        icon: <User size={14} className="text-slate-400" />,
      });
    } else if (pathname === '/admin') {
      items.push({
        label: 'Admin Dashboard',
        icon: <Shield size={14} className="text-slate-400" />,
      });
    } else if (pathname === '/admin/products') {
      items.push(
        {
          label: 'Admin Dashboard',
          path: '/admin',
          icon: <Shield size={14} className="text-slate-400" />,
        },
        {
          label: 'Manage Inventory',
          icon: <Package size={14} className="text-slate-400" />,
        }
      );
    } else if (pathname === '/admin/orders') {
      items.push(
        {
          label: 'Admin Dashboard',
          path: '/admin',
          icon: <Shield size={14} className="text-slate-400" />,
        },
        {
          label: 'Manage Deliveries',
          icon: <ClipboardList size={14} className="text-slate-400" />,
        }
      );
    } else {
      // General path resolver
      const parts = pathname.split('/').filter(Boolean);
      let currentPath = '';
      parts.forEach((part, index) => {
        currentPath += `/${part}`;
        const isLast = index === parts.length - 1;
        const formattedLabel = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        items.push({
          label: formattedLabel,
          path: isLast ? undefined : currentPath,
        });
      });
    }

    return items;
  };

  const breadcrumbs = renderItems();

  return (
    <nav
      id="site-breadcrumb"
      aria-label="Breadcrumb"
      className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 py-3 px-4 sm:px-6 lg:px-8 shadow-3xs transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
        {/* Breadcrumb List */}
        <ol className="flex items-center flex-wrap gap-2 text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />}

                {isLast ? (
                  <span className="text-slate-950 dark:text-slate-100 font-bold truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path || '/'}
                    className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-[1.02] transition-all duration-200 select-none py-0.5"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* Back Link Contextual Quick Actions */}
        {breadcrumbs.length > 1 && (
          <Link
            to={breadcrumbs[breadcrumbs.length - 2].path || '/'}
            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 uppercase font-mono tracking-wider hidden sm:inline-flex items-center gap-1"
          >
            ← Back to {typeof breadcrumbs[breadcrumbs.length - 2].label === 'string' ? breadcrumbs[breadcrumbs.length - 2].label : 'previous'}
          </Link>
        )}
      </div>
    </nav>
  );
};
