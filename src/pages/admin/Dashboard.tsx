import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  Clock,
  ArrowRight,
  Loader2,
  Settings,
  ListOrdered
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, Product } from '../../types';
import { toast } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Secure route logic
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      toast.error('Access Denied: Administrative permissions required.');
      navigate('/');
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get('/api/orders/all'),
          axios.get('/api/products?limit=1'), // Just to get total products from pagination
        ]);

        setOrders(ordersRes.data);
        setProductsCount(productsRes.data.pagination.total);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Could not load administrative summaries.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-100 rounded w-48" />
              <div className="h-3.5 bg-slate-100 rounded w-80" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-slate-100 rounded-xl w-32" />
            <div className="h-9 bg-slate-100 rounded-xl w-32" />
          </div>
        </div>

        {/* Analytics Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-8 w-8 bg-slate-50 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-7 bg-slate-100 rounded w-1/2" />
                <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Main split skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Recent Orders List Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="h-5 bg-slate-100 rounded w-28" />
              <div className="h-4 bg-slate-100 rounded w-16" />
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full w-16 mx-4" />
                  <div className="h-4 bg-slate-100 rounded w-12 text-right" />
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution Breakdown Skeleton */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
            <div className="h-5 bg-slate-100 rounded w-36" />
            <div className="space-y-4 pt-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 bg-slate-100 rounded w-20" />
                    <div className="h-3.5 bg-slate-100 rounded w-12" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analytical computations
  const totalRevenue = orders.reduce((acc, order) => {
    if (order.total === null || order.total === undefined) return acc;
    const val = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
    const validVal = isNaN(val) ? 0 : val;
    return acc + validVal;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-200 text-blue-700 shadow-3xs">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-xs text-slate-400 font-bold">Configure store inventory, review user transactions, and oversee logs.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100/50 transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-3xs text-slate-700 transition-colors flex items-center gap-1.5 bg-white"
          >
            <ListOrdered size={14} />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</span>
            <p className="text-[10px] text-slate-400">Total processed revenue checkout logs</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              <PackageCheck size={16} />
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{orders.length}</span>
            <p className="text-[10px] text-slate-400">Completed, shipped, and active orders</p>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
              <Clock size={16} />
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{pendingOrders}</span>
            <p className="text-[10px] text-slate-400">Requires review and status transitions</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalog Items</span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/50">
              <Settings size={16} />
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{productsCount}</span>
            <p className="text-[10px] text-slate-400">Active store inventory essentials</p>
          </div>
        </div>
      </div>

      {/* Main split: Recent orders + Status distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No orders recorded in the storefront yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.slice(0, 5).map(o => {
                    const price = (() => {
                      if (o.total === null || o.total === undefined) return 0;
                      const val = typeof o.total === 'string' ? parseFloat(o.total) : o.total;
                      return isNaN(val) ? 0 : val;
                    })();
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/40">
                        <td className="p-3 font-mono text-xs font-bold">#{o.id}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 block text-xs">{o.user_name}</span>
                          <span className="text-[10px] text-slate-400 block">{o.user_email}</span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                            o.status === 'pending'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : o.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                              : o.status === 'shipped'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-400">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-800 text-xs">${price.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Distribution Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Fulfillment Pipeline</h3>

          <div className="space-y-3.5">
            {/* Pending */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Pending Review</span>
                <span className="text-slate-700">{pendingOrders} orders</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 transition-all duration-500"
                  style={{ width: `${orders.length ? (pendingOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Processing */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Processing Inventory</span>
                <span className="text-slate-700">{processingOrders} orders</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${orders.length ? (processingOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Shipped */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Dispatched (Shipped)</span>
                <span className="text-slate-700">{shippedOrders} orders</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${orders.length ? (shippedOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Delivered */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Successfully Delivered</span>
                <span className="text-slate-700">{completedOrders} orders</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${orders.length ? (completedOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
