import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart: React.FC = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart();

  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-md">
          <ShoppingBag size={36} className="text-blue-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Your shopping cart is empty</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Head back to our catalog and discover our premium collections.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-100/50"
        >
          <ArrowLeft size={16} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-slate-400 hover:text-rose-600 font-bold text-xs flex items-center gap-1.5 p-2 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-3xs">
            {cartItems.map(item => {
              const itemPrice = (() => {
                if (item.product.price === null || item.product.price === undefined) return 0;
                const val = typeof item.product.price === 'string'
                  ? parseFloat(item.product.price)
                  : item.product.price;
                return isNaN(val) ? 0 : val;
              })();
              return (
                <div key={item.product.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4">
                  {/* Image */}
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-xl bg-slate-50 shrink-0 border border-slate-100"
                  />

                  {/* Details */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <Link to={`/product/${item.product.id}`} className="hover:underline hover:text-blue-600 transition-colors">
                      <h3 className="font-bold text-slate-800 text-base md:text-lg line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <span className="text-blue-600 text-[10px] font-bold block uppercase tracking-wider mt-1">
                      {item.product.category}
                    </span>
                    <span className="text-slate-900 font-extrabold text-sm mt-2 block sm:hidden">
                      ${itemPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Pricing and Qty (responsive layout) */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <span className="text-slate-900 font-extrabold text-sm hidden sm:block">
                      ${itemPrice.toFixed(2)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-3xs">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-40 font-bold border-r border-slate-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3.5 font-bold text-xs text-slate-800 min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2.5 py-1 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-40 font-bold border-l border-slate-200 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Remove product"
                    >
                      <Trash2 size={15} />
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors pl-2"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Financial Summary panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-3xs sticky top-24">
          <h2 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-3">Order Summary</h2>

          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-slate-800">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-slate-800">${tax.toFixed(2)}</span>
            </div>

            {shipping > 0 && (
              <p className="text-[11px] text-slate-400 leading-normal pt-1">
                Add <span className="font-bold text-slate-600">${(150 - subtotal).toFixed(2)}</span> more to your cart to qualify for free shipping.
              </p>
            )}
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-between text-slate-900 font-extrabold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-100/50 flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
