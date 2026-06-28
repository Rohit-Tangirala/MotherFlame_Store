import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ListOrdered,
  Loader2,
  X,
  ArrowLeft,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { toast } from 'react-hot-toast';

export const ManageOrders: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Secure route logic
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      toast.error('Access Denied: Admin role required');
      navigate('/');
    }
  }, [user, token, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/all');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders for admin:', error);
      toast.error('Could not load orders pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrders();
    }
  }, [user]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      toast.success(`Order #${orderId} transitioned to: ${newStatus}`);
      
      // Update local orders list state directly to preserve visual scroll position
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update fulfillment state.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Back button */}
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Manage Orders</h1>
        <p className="text-xs text-slate-400 font-bold">Oversee user deliveries, modify logistics tracking, and mark orders fulfilled.</p>
      </div>

      {/* Orders pipeline content */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4"
            >
              {/* Header Info Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-100 rounded w-28" />
                  <div className="h-3.5 bg-slate-50 rounded w-48" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-8 bg-slate-100 rounded-lg w-32" />
                </div>
              </div>

              {/* Order contents skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded w-16" />
                <div className="flex items-center gap-4 py-1">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-3 bg-slate-50 rounded w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 max-w-md mx-auto animate-fade-in">
          No user order logs currently registered in database.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const priceTotal = (() => {
              if (order.total === null || order.total === undefined) return 0;
              const val = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
              return isNaN(val) ? 0 : val;
            })();
            const orderDate = order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A';

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden divide-y divide-slate-100 animate-fade-in"
              >
                {/* Order header information */}
                <div className="p-4 md:p-6 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs md:text-sm">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Order Info</span>
                      <span className="font-mono font-bold text-slate-800 text-xs md:text-sm">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Purchaser Details</span>
                      <span className="font-bold text-slate-700 block text-xs">{order.user_name}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">{order.user_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Date Created</span>
                      <span className="font-bold text-slate-700 block text-xs">{orderDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Subtotal</span>
                      <span className="font-extrabold text-slate-900 block text-sm">${priceTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Fulfillment Status action selection */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Status:</span>
                    <div className="relative">
                      {updatingId === order.id ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold">
                          <Loader2 size={12} className="animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none font-bold text-xs rounded-xl px-4 py-1.5 pr-8 border outline-hidden transition-colors cursor-pointer select-none ${getStatusBadgeColor(
                            order.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* List of items inside order */}
                <div className="p-4 md:p-6 space-y-3.5 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ordered Inventory Elements</span>
                  <div className="divide-y divide-slate-100">
                    {order.items?.map(item => {
                      const itemCost = (() => {
                        if (item.price === null || item.price === undefined) return 0;
                        const val = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                        return isNaN(val) ? 0 : val;
                      })();
                      return (
                        <div key={item.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            <span className="text-sm font-bold text-slate-800">{item.product_name || `Product ID: ${item.product_id}`}</span>
                            <span className="text-xs text-slate-400 font-medium">({item.quantity} units)</span>
                          </div>
                          <span className="text-xs font-extrabold text-slate-800">${(itemCost * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
