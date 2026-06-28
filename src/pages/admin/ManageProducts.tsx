import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { toast } from 'react-hot-toast';

export const ManageProducts: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Form states for Create/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products?page=${page}&limit=10`);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
    }
  }, [user, page]);

  // Open modal for creating product
  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('');
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Open modal for editing product
  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategory(product.category);
    setImageFile(null);
    setImagePreview(product.image_url);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      return toast.error('Name, price, and stock quantities are required');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('category', category);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (editingId && imagePreview) {
        formData.append('imageUrl', imagePreview);
      }

      if (editingId) {
        // Update product
        await axios.put(`/api/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully!');
      } else {
        // Create product
        await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product added successfully!');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Action failed. Verify server environment and parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number, prodName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete product: "${prodName}"? This action is irreversible.`)) {
      return;
    }

    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product removed successfully.');
      fetchProducts();
    } catch (error) {
      console.error('Deletion failed:', error);
      toast.error('Failed to remove product. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Manage Products</h1>
          <p className="text-xs text-slate-400 font-bold">Incorporate, adjust, or retire products from the store catalogue.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-100/50 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Products list table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-4 w-16">Cover</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4 w-32">Category</th>
                  <th className="p-4 w-28 text-right">Price</th>
                  <th className="p-4 w-28 text-right">Stock</th>
                  <th className="p-4 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="p-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                    </td>
                    <td className="p-4 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-50 rounded w-2/3" />
                    </td>
                    <td className="p-4">
                      <div className="h-5 bg-slate-100 rounded-md w-16" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="h-4 bg-slate-100 rounded w-12 ml-auto" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="h-4 bg-slate-100 rounded w-8 ml-auto" />
                    </td>
                    <td className="p-4">
                      <div className="h-8 bg-slate-100 rounded-lg w-16" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 text-center text-slate-400 max-w-md mx-auto space-y-4 animate-fade-in">
          <p className="font-medium">No products currently registered in database.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Create first product
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <th className="p-4 w-16">Cover</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {products.map(p => {
                    const priceVal = (() => {
                      if (p.price === null || p.price === undefined) return 0;
                      const val = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                      return isNaN(val) ? 0 : val;
                    })();
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40">
                        <td className="p-4">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg bg-slate-50 border border-slate-100"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800 block text-xs md:text-sm">{p.name}</span>
                          <span className="text-[10px] text-slate-400 block max-w-xs truncate font-medium">{p.description}</span>
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-extrabold text-slate-900">${priceVal.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          {p.stock === 0 ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                              Sold Out
                            </span>
                          ) : (
                            <span className="text-slate-800 font-bold">{p.stock} units</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 border border-slate-200 hover:border-blue-600 hover:bg-blue-50 rounded-lg text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                              title="Edit product"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 border border-rose-200 hover:border-rose-500 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-all cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <span className="text-xs font-bold text-slate-400">
                Page <span className="text-slate-700">{page}</span> of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-all bg-white cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-all bg-white cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Product Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-extrabold text-lg text-slate-800">
                {editingId ? 'Modify Product Details' : 'Add New Essential'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Minimalist Bench, Aura Vase..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                  />
                </div>

                {/* Category & Prices */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="Furniture, Decor, Lighting..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="145.00"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                    />
                  </div>
                </div>

                {/* Stock & Description */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                      placeholder="15"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Product Description
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Details regarding build-materials, measurements, warranty..."
                      rows={2}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-xs md:text-sm outline-hidden resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Image upload area */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Product Image
                  </label>
                  <div className="flex gap-4 items-center">
                    {/* Preview box */}
                    <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Uploaded product preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={22} className="text-slate-300" />
                      )}
                    </div>
                    {/* File Picker input */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-bold file:bg-white file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                        Select a JPEG, PNG, or WebP photo (Max 5MB). Photo is dispatched straight to secure Cloudinary buckets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100/50 transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Publish Product'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs md:text-sm transition-colors bg-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
