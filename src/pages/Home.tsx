import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight, Filter,
  LayoutGrid, Armchair, Lamp, Laptop, ShoppingBag, Palette, BookOpen, Tag
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { toast } from 'react-hot-toast';
import { MotherflameLogo } from '../components/MotherflameLogo';

const getCategoryIcon = (category: any) => {
  if (!category || typeof category !== 'string') {
    return <Tag size={14} className="shrink-0" />;
  }
  const normalized = category.toLowerCase().trim();
  switch (normalized) {
    case 'all':
      return <LayoutGrid size={14} className="shrink-0" />;
    case 'furniture':
      return <Armchair size={14} className="shrink-0" />;
    case 'lighting':
      return <Lamp size={14} className="shrink-0" />;
    case 'electronics':
      return <Laptop size={14} className="shrink-0" />;
    case 'accessories':
      return <ShoppingBag size={14} className="shrink-0" />;
    case 'decor':
      return <Palette size={14} className="shrink-0" />;
    case 'stationery':
      return <BookOpen size={14} className="shrink-0" />;
    default:
      return <Tag size={14} className="shrink-0" />;
  }
};

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Read URL query params
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local filter states (so we don't spam the URL on every keystroke)
  const [searchVal, setSearchVal] = useState(searchParam);
  const [minPriceVal, setMinPriceVal] = useState(minPriceParam);
  const [maxPriceVal, setMaxPriceVal] = useState(maxPriceParam);
  const [showFilters, setShowFilters] = useState(false);

  // Update local states when search parameters change (e.g. back navigation)
  useEffect(() => {
    setSearchVal(searchParam);
    setMinPriceVal(minPriceParam);
    setMaxPriceVal(maxPriceParam);
  }, [searchParam, minPriceParam, maxPriceParam]);

  // Fetch products whenever URL parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchParam) params.append('search', searchParam);
        if (categoryParam && categoryParam !== 'All') params.append('category', categoryParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        params.append('page', String(pageParam));
        params.append('limit', '12');

        const response = await axios.get(`/api/products?${params.toString()}`);
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Could not load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParam, categoryParam, minPriceParam, maxPriceParam, pageParam]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams: any = { page: '1' }; // Reset to page 1 on new filters
    if (searchVal.trim()) newParams.search = searchVal;
    if (categoryParam !== 'All') newParams.category = categoryParam;
    if (minPriceVal) newParams.minPrice = minPriceVal;
    if (maxPriceVal) newParams.maxPrice = maxPriceVal;

    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setMinPriceVal('');
    setMaxPriceVal('');
    setSearchParams({ page: '1' });
  };

  const handleCategorySelect = (category: string) => {
    const newParams: any = { page: '1' };
    if (searchParam) newParams.search = searchParam;
    if (category !== 'All') newParams.category = category;
    if (minPriceParam) newParams.minPrice = minPriceParam;
    if (maxPriceParam) newParams.maxPrice = maxPriceParam;

    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newParams = Object.fromEntries(searchParams.entries());
    newParams.page = String(newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Banner / Headline */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 min-h-[220px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-blue-950 opacity-90" />
        
        <div className="relative z-10 max-w-xl space-y-3 flex-1">
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full inline-block">
            MOTHER FLAME OFFICIAL STOREFRONT
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Curated Living & Modern Essentials
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Beautifully crafted items tailored for daily comfort, visual elegance, and long-lasting durability. Backed by the pure, undying energy of the Motherflame.
          </p>
        </div>

        {/* Large Decorative Floating/Glowing Motherflame Emblem */}
        <div className="relative z-10 hidden md:flex items-center justify-center pr-4">
          <div className="relative group p-1 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-xs shadow-2xl transition-transform duration-500 hover:scale-105">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-slate-950/90 rounded-xl p-5 flex flex-col items-center text-center w-52 space-y-2">
              <MotherflameLogo size={80} />
              <div>
                <h4 className="text-sm font-extrabold tracking-tight uppercase text-white leading-none">
                  Mother<span className="text-orange-500 font-bold normal-case">flame</span>
                </h4>
                <p className="text-[7px] font-bold font-mono tracking-widest text-slate-400 uppercase mt-1">
                  The Undying Energy Source
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar / Search and Filters toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-6">
        <form onSubmit={handleApplyFilters} className="w-full md:max-w-md flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-sm outline-hidden transition-all shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs md:text-sm font-bold rounded-xl transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 w-full md:w-auto items-center justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs md:text-sm font-bold transition-colors shadow-xs ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>

          {(minPriceParam || maxPriceParam || searchParam || categoryParam !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Price Filters Drawer */}
      {showFilters && (
        <form
          onSubmit={handleApplyFilters}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fade-in"
        >
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Minimum Price ($)
            </label>
            <input
              type="number"
              placeholder="0"
              value={minPriceVal}
              onChange={e => setMinPriceVal(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-sm outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Maximum Price ($)
            </label>
            <input
              type="number"
              placeholder="1000"
              value={maxPriceVal}
              onChange={e => setMaxPriceVal(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-sm outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Apply Ranges
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors bg-white"
            >
              Clear
            </button>
          </div>
        </form>
      )}

      {/* Category Pills (Dynamic) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 ${
              categoryParam === cat
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {getCategoryIcon(cat)}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Main Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
            <Filter size={24} className="text-slate-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">No products found</h3>
            <p className="text-slate-400 text-sm mt-1">
              There are no products matching your active search, category, or price constraints.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-100"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination panel */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-500">
                Showing page <span className="font-bold text-slate-850">{pageParam}</span> of{' '}
                <span className="font-bold text-slate-850">{totalPages}</span> ({totalCount} total essentials)
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pageParam - 1)}
                  disabled={pageParam === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 hover:text-blue-600 transition-colors bg-white"
                  title="Previous Page"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-9 w-9 text-xs font-bold rounded-lg transition-colors ${
                        pageParam === pNum
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 bg-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pageParam + 1)}
                  disabled={pageParam === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 hover:text-blue-600 transition-colors bg-white"
                  title="Next Page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
