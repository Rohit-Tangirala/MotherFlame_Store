import express, { Response } from 'express';
import pool from '../db';
import { verifyToken, AuthenticatedRequest } from '../middleware/verifyToken';
import { isAdmin } from '../middleware/isAdmin';
import { sendOrderConfirmationEmail } from '../utils/sendEmail';

const router = express.Router();

// POST /api/orders (User only: place a new order)
router.post('/', verifyToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { items } = req.body; // Array of { productId: number, quantity: number }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const connection = await pool.getConnection();

  try {
    // Start Transaction
    await connection.beginTransaction();

    let orderTotal = 0;
    const itemsWithDetails: Array<{
      productId: number;
      name: string;
      quantity: number;
      price: number;
    }> = [];

    // Validate stock and calculate prices
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Invalid product or quantity in order items' });
      }

      // Fetch latest product details from DB within transaction (FOR UPDATE to lock row)
      const [productRows]: [any[], any] = await connection.query(
        'SELECT * FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      const product = productRows[0];

      if (product.stock < quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Insufficient stock for product "${product.name}". Available stock: ${product.stock}`,
        });
      }

      const itemTotal = Number(product.price) * quantity;
      orderTotal += itemTotal;

      itemsWithDetails.push({
        productId,
        name: product.name,
        quantity,
        price: Number(product.price),
      });

      // Decrement product stock
      const newStock = product.stock - quantity;
      await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
    }

    // Insert Order
    const [orderResult]: any = await connection.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.user.id, orderTotal, 'pending']
    );

    const orderId = orderResult.insertId;

    // Insert Order Items
    for (const detail of itemsWithDetails) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, detail.productId, detail.quantity, detail.price]
      );
    }

    // Commit Transaction
    await connection.commit();
    console.log(`Transaction committed. Order #${orderId} created successfully.`);

    // Send confirmation email asynchronously (don't block API response)
    sendOrderConfirmationEmail(req.user.email, {
      orderId,
      items: itemsWithDetails,
      total: orderTotal,
    }).catch(err => console.error('Error sending confirmation email in background:', err));

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      total: orderTotal,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error processing order transaction:', error);
    res.status(500).json({ message: 'Internal server error while processing order' });
  } finally {
    connection.release();
  }
});

// GET /api/orders (User only: see their own order history with status)
router.get('/', verifyToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get user orders
    const [orders]: [any[], any] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // For each order, fetch its order items and product details
    const ordersWithItems = [];
    for (const order of orders) {
      const [items]: [any[], any] = await pool.query(
        `SELECT oi.*, p.name as product_name, p.image_url as product_image 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items,
      });
    }

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/orders/all (Admin only: see all orders)
router.get('/all', verifyToken as any, isAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [orders]: [any[], any] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );

    const allOrdersWithItems = [];
    for (const order of orders) {
      const [items]: [any[], any] = await pool.query(
        `SELECT oi.*, p.name as product_name 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      allOrdersWithItems.push({
        ...order,
        items,
      });
    }

    res.json(allOrdersWithItems);
  } catch (error) {
    console.error('Error fetching all orders for admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/orders/:id (Admin only: update order status)
router.put('/:id', verifyToken as any, isAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const [existing]: [any[], any] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated successfully', orderId: parseInt(id, 10), status });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
