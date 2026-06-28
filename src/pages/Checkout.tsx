import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CreditCard, ShieldCheck, Truck, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

export const Checkout: React.FC = () => {
  const { user, token } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Protected route logic
  useEffect(() => {
    if (!token) {
      toast.error('Please login to continue to checkout');
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [token, navigate, location]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-slate-500 text-sm">You must add some items to your cart before proceeding to checkout.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100/50">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address || !city || !zip || !cardNumber || !cardExpiry || !cardCvv) {
      return toast.error('Please complete all shipping and payment fields.');
    }

    setSubmitting(true);
    try {
      // Map cartItems to what the API expects
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await axios.post('/api/orders', { items: orderItems });

      toast.success('Order placed successfully! A confirmation email has been dispatched.');
      clearCart();
      navigate('/orders');
    } catch (error: any) {
      console.error('Checkout failed:', error);
      const msg = error.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} />
        Return to Shopping Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping Form Panel */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          {/* Shipping Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck size={18} className="text-blue-600" />
              Shipping Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Creative Street, Apt 4B"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    placeholder="10001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard size={18} className="text-blue-600" />
              Payment Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Order Items Summary Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Items in Order</h2>

          {/* Items scroll */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-2">
            {cartItems.map(item => {
              const itemPrice = (() => {
                if (item.product.price === null || item.product.price === undefined) return 0;
                const val = typeof item.product.price === 'string'
                  ? parseFloat(item.product.price)
                  : item.product.price;
                return isNaN(val) ? 0 : val;
              })();
              return (
                <div key={item.product.id} className="flex gap-3 py-3 items-center">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-md bg-slate-50 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 truncate">{item.product.name}</h4>
                    <span className="text-blue-600 text-[9px] font-bold uppercase">{item.product.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-800 block">${(itemPrice * item.quantity).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">Qty: {item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-slate-100" />

          {/* Bill breakdown */}
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-700">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-slate-700">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-slate-700">${tax.toFixed(2)}</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-between text-slate-900 font-extrabold text-base">
            <span>Total to pay</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs md:text-sm transition-all shadow-lg shadow-blue-100/50 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <span>Place Order Safely</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Secure 256-bit Payment Verification Protocol Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
