import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setIsCartOpen } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`Added ${product.name} to cart!`);
      setIsCartOpen(true);
    }
  };

  const formattedPrice = (() => {
    if (product.price === null || product.price === undefined) {
      return '0.00';
    }
    const val = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    return isNaN(val) ? '0.00' : val.toFixed(2);
  })();

  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 flex flex-col h-full"
    >
      {/* Product Image Container */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <motion.img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
          variants={{
            hover: { scale: 1.06 }
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Only {product.stock} left
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[10px] font-bold text-blue-600 uppercase mb-1 block tracking-wider">
          {product.category}
        </span>

        {/* Title */}
        <Link to={`/product/${product.id}`} className="block group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 group-hover:underline decoration-blue-600/30">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-500 text-xs mt-1 mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Spacer */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-base md:text-lg font-extrabold text-slate-900">
            ${formattedPrice}
          </span>
          
          <div className="flex items-center gap-2">
            <Link
              to={`/product/${product.id}`}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </Link>
            
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-sm'
              }`}
            >
              <ShoppingCart size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
