import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardCheck, Loader2, Calendar, ShoppingBag, Package, Check, Clock, Settings, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

export const Orders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Could not load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Helper to get status badge colors
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'shipped':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        {/* Title skeleton */}
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
          <div className="h-8 w-8 bg-slate-100 rounded-lg" />
          <div className="h-8 bg-slate-100 rounded w-44" />
        </div>

        {/* Order Cards Skeletons */}
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col divide-y divide-slate-100"
            >
              {/* Card Header Skeleton */}
              <div className="p-4 md:p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-16" />
                    <div className="h-4 bg-slate-100 rounded w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-16" />
                    <div className="h-4 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-16" />
                    <div className="h-4 bg-slate-100 rounded w-20" />
                  </div>
                </div>
                <div className="h-6 bg-slate-100 rounded-full w-24" />
              </div>

              {/* Progress Line Skeleton */}
              <div className="p-5 md:p-6 bg-slate-50/25 space-y-4">
                <div className="h-3 bg-slate-100 rounded w-32" />
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>

              {/* Items List Skeleton */}
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3.5 bg-slate-100 rounded w-12" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
          <Package size={28} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">You haven't placed any orders yet</h2>
          <p className="text-slate-500 text-sm mt-1">Once you purchase items from our storefront, your order status and details will show up right here.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-100/50"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
        <ClipboardCheck size={26} className="text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
      </div>

      <div className="space-y-6">
        {orders.map(order => {
          const orderTotal = (() => {
            if (order.total === null || order.total === undefined) return 0;
            const val = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
            return isNaN(val) ? 0 : val;
          })();
          const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) : 'Recently placed';

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col divide-y divide-slate-100"
            >
              {/* Order Header */}
              <div className="p-4 md:p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs md:text-sm">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Order Placed</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Calendar size={14} className="text-blue-500" />
                      {orderDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Order ID</span>
                    <span className="font-mono font-bold text-slate-800 text-xs md:text-sm">#{order.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Total Bill</span>
                    <span className="font-extrabold text-slate-900">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(order.status)} uppercase tracking-wider`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Real-time Order Progress Bar */}
              {(() => {
                const currentStepIndex = (() => {
                  switch (order.status) {
                    case 'pending': return 0;
                    case 'processing': return 1;
                    case 'shipped': return 2;
                    case 'delivered': return 3;
                    default: return 0;
                  }
                })();

                const steps = [
                  { key: 'pending', label: 'Pending', icon: Clock },
                  { key: 'processing', label: 'Processing', icon: Settings },
                  { key: 'shipped', label: 'Shipped', icon: Truck },
                  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
                ];

                return (
                  <div className="p-5 md:p-6 bg-slate-50/25 border-b border-slate-100">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Live Order Progress
                    </div>
                    <div className="relative max-w-xl mx-auto px-[18px]">
                      {/* Background Line */}
                      <div className="absolute top-[18px] left-[18px] right-[18px] h-1 bg-slate-100/80 -translate-y-1/2 rounded-full" />
                      
                      {/* Filled Progress Line */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStepIndex / 3) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute top-[18px] left-[18px] h-1 bg-blue-600 -translate-y-1/2 rounded-full"
                      />

                      {/* Step Nodes */}
                      <div className="relative z-10 flex justify-between">
                        {steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex;
                          const isActive = idx === currentStepIndex;
                          const StepIcon = step.icon;

                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              {/* Step circle */}
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.08, duration: 0.3 }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isCompleted
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : isActive
                                    ? 'bg-white border-blue-600 text-blue-600 shadow-md ring-4 ring-blue-50'
                                    : 'bg-white border-slate-200 text-slate-400'
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-5 h-5" strokeWidth={3} />
                                ) : (
                                  <StepIcon className={`w-4 h-4 ${isActive ? (step.key === 'processing' ? 'animate-spin' : 'animate-pulse') : ''}`} style={isActive && step.key === 'processing' ? { animationDuration: '3s' } : {}} />
                                )}
                              </motion.div>
                              
                              {/* Step text */}
                              <span className={`mt-2 text-[10px] sm:text-xs font-bold tracking-tight text-center transition-colors duration-300 ${
                                isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Order Items Body */}
              <div className="p-4 md:p-6 divide-y divide-slate-100">
                {order.items?.map(item => {
                  const itemPrice = (() => {
                    if (item.price === null || item.price === undefined) return 0;
                    const val = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    return isNaN(val) ? 0 : val;
                  })();
                  return (
                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name || 'Product cover'}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg bg-slate-50 border border-slate-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                          <ShoppingBag size={20} className="text-slate-300" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">
                          {item.product_name || `Product ID: ${item.product_id}`}
                        </h4>
                        <span className="text-slate-400 text-xs block mt-0.5">
                          Qty: {item.quantity} • ${itemPrice.toFixed(2)} each
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 text-sm">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
