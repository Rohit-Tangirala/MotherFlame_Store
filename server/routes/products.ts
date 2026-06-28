import express, { Response } from 'express';
import pool from '../db';
import { verifyToken } from '../middleware/verifyToken';
import { isAdmin } from '../middleware/isAdmin';
import { upload, uploadToCloudinary } from '../utils/upload';

const router = express.Router();

// GET /api/products (Public catalog with search, filters, pagination)
router.get('/', async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const category = req.query.category ? String(req.query.category) : null;
    const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : null;

    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const params: any[] = [];
    const countParams: any[] = [];

    if (search) {
      query += ' AND name LIKE ?';
      countQuery += ' AND name LIKE ?';
      params.push(search);
      countParams.push(search);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    if (minPrice !== null) {
      query += ' AND price >= ?';
      countQuery += ' AND price >= ?';
      params.push(minPrice);
      countParams.push(minPrice);
    }

    if (maxPrice !== null) {
      query += ' AND price <= ?';
      countQuery += ' AND price <= ?';
      params.push(maxPrice);
      countParams.push(maxPrice);
    }

    // Add pagination limit and offset to products query
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Run both queries in parallel
    const [[products], [countRows]]: [any[], any] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);

    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get unique categories for filters
    const [categoryRows]: [any[], any] = await pool.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""'
    );
    const categories = ['All', ...categoryRows.map(row => row.category)];

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      categories,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/:id (Public single product details)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows]: [any[], any] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/products (Admin only: create product with image upload)
router.post('/', verifyToken as any, isAdmin as any, upload.single('image'), async (req: any, res: Response) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Product name and price are required' });
  }

  try {
    let imageUrl = '';
    if (req.file) {
      // Upload image buffer to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';
    }

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock || '0', 10);

    const [result]: any = await pool.query(
      'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', numericPrice, numericStock, category || 'Uncategorized', imageUrl]
    );

    const newProduct = {
      id: result.insertId,
      name,
      description,
      price: numericPrice,
      stock: numericStock,
      category,
      image_url: imageUrl,
    };

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/products/:id (Admin only: update product with optional image upload)
router.put('/:id', verifyToken as any, isAdmin as any, upload.single('image'), async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;

  try {
    // Check if product exists
    const [existing]: [any[], any] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentProduct = existing[0];

    let imageUrl = currentProduct.image_url;
    if (req.file) {
      // Upload new image buffer to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const updatedName = name !== undefined ? name : currentProduct.name;
    const updatedDescription = description !== undefined ? description : currentProduct.description;
    const updatedPrice = price !== undefined ? parseFloat(price) : currentProduct.price;
    const updatedStock = stock !== undefined ? parseInt(stock, 10) : currentProduct.stock;
    const updatedCategory = category !== undefined ? category : currentProduct.category;

    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?',
      [updatedName, updatedDescription, updatedPrice, updatedStock, updatedCategory, imageUrl, id]
    );

    res.json({
      id: parseInt(id, 10),
      name: updatedName,
      description: updatedDescription,
      price: updatedPrice,
      stock: updatedStock,
      category: updatedCategory,
      image_url: imageUrl,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/products/:id (Admin only: delete product)
router.delete('/:id', verifyToken as any, isAdmin as any, async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const [existing]: [any[], any] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully', id: parseInt(id, 10) });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
