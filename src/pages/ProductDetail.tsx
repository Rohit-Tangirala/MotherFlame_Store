import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, Loader2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error: any) {
        console.error('Failed to fetch product details:', error);
        toast.error('Product not found or failed to load.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        {/* Back breadcrumb skeleton */}
        <div className="h-5 bg-slate-200/80 rounded w-28 animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs animate-pulse">
          {/* Product Image Skeleton */}
          <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200/50" />

          {/* Product Info Skeleton */}
          <div className="flex flex-col justify-between py-2 space-y-6">
            <div className="space-y-4">
              {/* Category tag skeleton */}
              <div className="h-6 bg-slate-100 rounded-full w-24" />

              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-8 bg-slate-100 rounded w-5/6" />
                <div className="h-8 bg-slate-100 rounded w-1/2" />
              </div>

              {/* Price & Stock skeleton */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="h-10 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-24" />
              </div>

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-4/5" />
              </div>
            </div>

            {/* Quantity and Actions skeleton */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-4 bg-slate-100 rounded w-16" />
                <div className="h-10 bg-slate-100 rounded-xl w-32" />
              </div>

              <div className="h-12 bg-slate-100 rounded-xl w-full" />

              {/* Features skeleton */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
                <div className="h-20 bg-slate-50 border border-slate-100/50 rounded-xl" />
                <div className="h-20 bg-slate-50 border border-slate-100/50 rounded-xl" />
                <div className="h-20 bg-slate-50 border border-slate-100/50 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="font-bold text-lg text-slate-800">Product not found</h3>
        <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
          Return to catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product, quantity);
      toast.success(`Added ${quantity} x ${product.name} to cart!`);
      setIsCartOpen(true);
    }
  };

  const productPrice = (() => {
    if (product.price === null || product.price === undefined) return 0;
    const val = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    return isNaN(val) ? 0 : val;
  })();
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Back breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
          <img
            src={product.image_url}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            {/* Category */}
            <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50 inline-block">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-4 border-b border-slate-100 pb-4">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                ${productPrice.toFixed(2)}
              </span>

              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-2 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 font-bold border-r border-slate-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-5 font-bold text-sm text-slate-800 text-center min-w-[40px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3.5 py-2 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 font-bold border-l border-slate-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100/50 active:scale-95'
                }`}
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Features badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 space-y-1">
                <Truck size={18} className="text-blue-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block uppercase">Free Shipping</span>
                <span className="text-[9px] text-slate-400 block">On orders over $150</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 space-y-1">
                <RefreshCw size={18} className="text-blue-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block uppercase">Easy Returns</span>
                <span className="text-[9px] text-slate-400 block">30 days return window</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 space-y-1">
                <ShieldCheck size={18} className="text-blue-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block uppercase">100% Secure</span>
                <span className="text-[9px] text-slate-400 block">Fully encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
