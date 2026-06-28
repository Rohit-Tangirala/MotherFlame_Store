import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-slate-800" />
                <h2 className="font-bold text-lg text-slate-800">Your Cart</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <ShoppingBag size={28} className="text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Your cart is empty</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Explore our products and find something you love.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Start Shopping <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                cartItems.map(item => {
                  const itemPrice = (() => {
                    if (item.product.price === null || item.product.price === undefined) return 0;
                    const val = typeof item.product.price === 'string'
                      ? parseFloat(item.product.price)
                      : item.product.price;
                    return isNaN(val) ? 0 : val;
                  })();
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                    >
                      {/* Product Image */}
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg bg-slate-50 border border-slate-100/50"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-slate-500 text-xs block mb-1">
                          ${itemPrice.toFixed(2)} each
                        </span>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-slate-800 text-xs font-bold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Total and delete */}
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-slate-800 font-bold">
                  <span>Subtotal</span>
                  <span className="text-lg font-extrabold text-slate-900">${getCartTotal().toFixed(2)}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleViewCart}
                    className="w-full py-3 px-4 border border-slate-200 hover:border-slate-850 hover:text-slate-900 rounded-xl text-slate-600 text-xs md:text-sm font-semibold transition-colors bg-white"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100/50 animate-pulse-subtle"
                  >
                    Checkout <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
