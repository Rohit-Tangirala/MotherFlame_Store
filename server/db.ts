import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

let realPool: mysql.Pool;
let useMock = false;

const sslConfig = {
  rejectUnauthorized: false
};

// Clean any ssl-mode=... parameters from URI to avoid the mysql2 configuration warning
const rawUri = process.env.MYSQL_URI || process.env.DATABASE_URL;
const cleanedUri = rawUri ? rawUri.replace(/[?&]ssl-mode=[^&]+/gi, '') : undefined;

const connectionConfig: mysql.PoolOptions = cleanedUri
  ? {
      uri: cleanedUri,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }
  : {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'ecommerce',
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

try {
  realPool = mysql.createPool(connectionConfig);
  console.log('MySQL Pool created successfully.');
} catch (error) {
  console.error('Failed to create MySQL Pool, using fallback mock DB:', error);
  useMock = true;
}

// Local JSON file path for persistent mock DB fallback
const DB_FILE = path.join(process.cwd(), 'server', 'db.json');

interface DatabaseSchema {
  users: any[];
  products: any[];
  orders: any[];
  order_items: any[];
  newsletters: any[];
}

function readData(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (!parsed.newsletters) {
        parsed.newsletters = [];
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error reading JSON DB file:', error);
  }
  
  const defaultSchema: DatabaseSchema = {
    users: [],
    products: [],
    orders: [],
    order_items: [],
    newsletters: []
  };
  
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultSchema, null, 2), 'utf8');
  return defaultSchema;
}

function writeData(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing JSON DB file:', error);
  }
}

class MockConnection {
  async query(sql: string, params?: any[]): Promise<[any, any]> {
    return mockQueryExecutor(sql, params);
  }

  async beginTransaction(): Promise<void> {
    // No-op for JSON DB
  }

  async commit(): Promise<void> {
    // No-op for JSON DB
  }

  async rollback(): Promise<void> {
    // No-op for JSON DB
  }

  release(): void {
    // No-op
  }
}

// Function to filter and paginate products based on SQL segments and parameters
function getFilteredProducts(sql: string, params: any[], products: any[]): any[] {
  const segments = sql.split('?');
  let search: string | null = null;
  let category: string | null = null;
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let limit: number | null = null;
  let offset: number | null = null;

  for (let i = 0; i < params.length; i++) {
    const segment = segments[i].toUpperCase();
    const val = params[i];
    if (segment.includes('LIKE')) {
      search = val;
    } else if (segment.includes('CATEGORY =')) {
      category = val;
    } else if (segment.includes('PRICE >=')) {
      minPrice = Number(val);
    } else if (segment.includes('PRICE <=')) {
      maxPrice = Number(val);
    } else if (segment.includes('LIMIT')) {
      limit = Number(val);
    } else if (segment.includes('OFFSET')) {
      offset = Number(val);
    }
  }

  let filtered = [...products];
  if (search) {
    const term = search.replace(/^%|%$/g, '').toLowerCase();
    filtered = filtered.filter(p => {
      const nameStr = p && p.name !== undefined && p.name !== null ? String(p.name) : '';
      return nameStr.toLowerCase().includes(term);
    });
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(p => {
      const catStr = p && p.category !== undefined && p.category !== null ? String(p.category) : '';
      return catStr.toLowerCase() === category.toLowerCase();
    });
  }
  if (minPrice !== null && !isNaN(minPrice)) {
    filtered = filtered.filter(p => Number(p.price) >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    filtered = filtered.filter(p => Number(p.price) <= maxPrice);
  }

  // Sorting: by created_at DESC (default)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination
  if (limit !== null && limit !== undefined && !isNaN(limit)) {
    const off = (offset !== null && offset !== undefined && !isNaN(offset)) ? offset : 0;
    filtered = filtered.slice(off, off + limit);
  }

  return filtered;
}

function mockQueryExecutor(sql: string, params: any[] = []): [any, any] {
  const data = readData();
  const sqlTrimmed = sql.trim();

  // 1. SELECT * FROM users WHERE email = ?
  if (/SELECT \* FROM users WHERE email = \?/i.test(sqlTrimmed)) {
    const email = params[0];
    const rows = data.users.filter(u => u.email === email);
    return [rows, undefined];
  }

  // 2. SELECT id, name, email, role, created_at FROM users WHERE id = ?
  if (/SELECT id, name, email, role, created_at FROM users WHERE id = \?/i.test(sqlTrimmed)) {
    const id = Number(params[0]);
    const rows = data.users
      .filter(u => u.id === id)
      .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at }));
    return [rows, undefined];
  }

  // 3. INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  if (/INSERT INTO users/i.test(sqlTrimmed)) {
    const [name, email, password_hash, role] = params;
    const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id,
      name,
      email,
      password_hash,
      role: role || 'user',
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    writeData(data);
    return [{ insertId: id }, undefined];
  }

  // UPDATE users SET name = ?, email = ? WHERE id = ?
  if (/UPDATE users SET name = \?, email = \? WHERE id = \?/i.test(sqlTrimmed)) {
    const [name, email, id] = params;
    const userIndex = data.users.findIndex(u => u.id === Number(id));
    if (userIndex !== -1) {
      data.users[userIndex].name = name;
      data.users[userIndex].email = email;
      writeData(data);
    }
    return [{ affectedRows: 1 }, undefined];
  }

  // UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?
  if (/UPDATE users SET name = \?, email = \?, password_hash = \? WHERE id = \?/i.test(sqlTrimmed)) {
    const [name, email, password_hash, id] = params;
    const userIndex = data.users.findIndex(u => u.id === Number(id));
    if (userIndex !== -1) {
      data.users[userIndex].name = name;
      data.users[userIndex].email = email;
      data.users[userIndex].password_hash = password_hash;
      writeData(data);
    }
    return [{ affectedRows: 1 }, undefined];
  }

  // 4. SELECT COUNT(*) as total FROM products... / SELECT COUNT(*) as count FROM products...
  if (/SELECT COUNT\(\*\) as (\w+) FROM products/i.test(sqlTrimmed)) {
    const match = sqlTrimmed.match(/SELECT COUNT\(\*\) as (\w+) FROM products/i);
    const countAlias = match ? match[1] : 'total';
    const filteredProducts = getFilteredProducts(sqlTrimmed, params, data.products);
    return [[{ [countAlias]: filteredProducts.length }], undefined];
  }

  // 5. SELECT * FROM products ...
  if (/SELECT \* FROM products/i.test(sqlTrimmed)) {
    if (/WHERE id = \?/i.test(sqlTrimmed)) {
      const id = Number(params[0]);
      const rows = data.products.filter(p => p.id === id);
      return [rows, undefined];
    }
    
    const filteredProducts = getFilteredProducts(sqlTrimmed, params, data.products);
    return [filteredProducts, undefined];
  }

  // 6. SELECT DISTINCT category FROM products
  if (/SELECT DISTINCT category FROM products/i.test(sqlTrimmed)) {
    const categories = Array.from(new Set(data.products.map(p => p.category).filter(c => c)));
    const rows = categories.map(c => ({ category: c }));
    return [rows, undefined];
  }

  // 7. INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)
  if (/INSERT INTO products/i.test(sqlTrimmed)) {
    const [name, description, price, stock, category, image_url] = params;
    const id = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id,
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      image_url,
      created_at: new Date().toISOString()
    };
    data.products.push(newProduct);
    writeData(data);
    return [{ insertId: id }, undefined];
  }

  // 8.1 SPECIFIC: UPDATE products SET stock = ? WHERE id = ?
  if (/UPDATE products SET stock\s*=\s*\?\s*WHERE id\s*=\s*\?/i.test(sqlTrimmed)) {
    const [stock, id] = params;
    const pIdx = data.products.findIndex(p => p.id === Number(id));
    if (pIdx !== -1) {
      data.products[pIdx].stock = Number(stock);
      writeData(data);
      return [{ affectedRows: 1 }, undefined];
    }
    return [{ affectedRows: 0 }, undefined];
  }

  // 8. UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?
  if (/UPDATE products SET/i.test(sqlTrimmed)) {
    const id = Number(params[params.length - 1]);
    const pIdx = data.products.findIndex(p => p.id === id);
    if (pIdx !== -1) {
      const [name, description, price, stock, category, image_url] = params;
      data.products[pIdx] = {
        ...data.products[pIdx],
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        image_url
      };
      writeData(data);
      return [{ affectedRows: 1 }, undefined];
    }
    return [{ affectedRows: 0 }, undefined];
  }

  // 9. DELETE FROM products WHERE id = ?
  if (/DELETE FROM products WHERE id = \?/i.test(sqlTrimmed)) {
    const id = Number(params[0]);
    const initialLen = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== initialLen) {
      writeData(data);
      return [{ affectedRows: 1 }, undefined];
    }
    return [{ affectedRows: 0 }, undefined];
  }

  // 10. INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)
  if (/INSERT INTO orders/i.test(sqlTrimmed)) {
    const [user_id, total, status] = params;
    const id = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
    const newOrder = {
      id,
      user_id: Number(user_id),
      total: Number(total),
      status: status || 'pending',
      created_at: new Date().toISOString()
    };
    data.orders.push(newOrder);
    writeData(data);
    return [{ insertId: id }, undefined];
  }

  // 11. INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)
  if (/INSERT INTO order_items/i.test(sqlTrimmed)) {
    const [order_id, product_id, quantity, price] = params;
    const id = data.order_items.length > 0 ? Math.max(...data.order_items.map(oi => oi.id)) + 1 : 1;
    const newOrderItem = {
      id,
      order_id: Number(order_id),
      product_id: Number(product_id),
      quantity: Number(quantity),
      price: Number(price)
    };
    data.order_items.push(newOrderItem);
    writeData(data);
    return [{ insertId: id }, undefined];
  }

  // INSERT INTO newsletters (email) VALUES (?)
  if (/INSERT INTO newsletters/i.test(sqlTrimmed)) {
    const [email] = params;
    if (!data.newsletters) {
      data.newsletters = [];
    }
    const exists = data.newsletters.some(n => n.email && n.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('Email is already subscribed');
    }
    const id = data.newsletters.length > 0 ? Math.max(...data.newsletters.map(n => n.id)) + 1 : 1;
    const newNewsletter = {
      id,
      email,
      created_at: new Date().toISOString()
    };
    data.newsletters.push(newNewsletter);
    writeData(data);
    return [{ insertId: id }, undefined];
  }

  // 12. SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  if (/SELECT \* FROM orders WHERE user_id = \?/i.test(sqlTrimmed)) {
    const userId = Number(params[0]);
    const rows = data.orders
      .filter(o => o.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [rows, undefined];
  }

  // 13. SELECT * FROM orders WHERE id = ?
  if (/SELECT \* FROM orders WHERE id = \?/i.test(sqlTrimmed)) {
    const id = Number(params[0]);
    const rows = data.orders.filter(o => o.id === id);
    return [rows, undefined];
  }

  // 14. SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC
  if (/FROM orders o/i.test(sqlTrimmed) && /JOIN users/i.test(sqlTrimmed)) {
    const rows = data.orders
      .map(o => {
        const user = data.users.find(u => u.id === o.user_id);
        return {
          ...o,
          user_name: user ? user.name : 'Unknown',
          user_email: user ? user.email : 'unknown@example.com'
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [rows, undefined];
  }

  // 15. SELECT oi.*, p.name as product_name, p.image_url as product_image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
  if (/FROM order_items oi/i.test(sqlTrimmed) && /order_id = \?/i.test(sqlTrimmed)) {
    const orderId = Number(params[0]);
    const items = data.order_items.filter(oi => oi.order_id === orderId);
    const rows = items.map(oi => {
      const p = data.products.find(prod => prod.id === oi.product_id);
      return {
        ...oi,
        product_name: p ? p.name : `Product #${oi.product_id}`,
        product_image: p ? p.image_url : ''
      };
    });
    return [rows, undefined];
  }

  // 16. UPDATE orders SET status = ? WHERE id = ?
  if (/UPDATE orders SET status = \?/i.test(sqlTrimmed)) {
    const [status, id] = params;
    const oIdx = data.orders.findIndex(o => o.id === Number(id));
    if (oIdx !== -1) {
      data.orders[oIdx].status = status;
      writeData(data);
      return [{ affectedRows: 1 }, undefined];
    }
    return [{ affectedRows: 0 }, undefined];
  }

  console.warn('⚠️ WARNING: Unhandled mock query execution:', sqlTrimmed, params);
  return [[], undefined];
}

// Function to initialize tables or seed mock data
export async function initDatabase() {
  if (useMock) {
    console.log('Using local JSON database fallback.');
    const data = readData();
    if (data.products.length === 0) {
      console.log('Seeding default products to JSON database...');
      const seedProducts = [
        {
          id: 1,
          name: 'Nordic Minimalist Lounge Chair',
          description: 'Sleek wooden accents with premium wool blend cushions. Perfect for any modern living space or study.',
          price: 299.99,
          stock: 15,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Aura Matte Desk Lamp',
          description: 'Dimmable brass-finished table accessory with dynamic warm/cool light adjustments and wireless phone charging base.',
          price: 89.50,
          stock: 24,
          category: 'Lighting',
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Apex Noise-Cancelling Headphones',
          description: 'Acoustically superior wireless over-ear headphones with custom spatial audio and up to 45 hours of battery life.',
          price: 199.00,
          stock: 10,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Suede Travel Duffel Bag',
          description: 'Waterproof full-grain suede exterior with a dedicated laptop compartment and shoe separation bag.',
          price: 145.00,
          stock: 8,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Minimalist Ceramic Vase Set',
          description: 'Set of three earthy matte terracotta vases in varying sizes to elevate bookshelves and mantelpieces.',
          price: 45.00,
          stock: 30,
          category: 'Decor',
          image_url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 6,
          name: 'Bespoke Leather Notebook',
          description: 'Refillable, rich brown leather cover containing hand-stitched 120GSM fountain-pen friendly cotton sheets.',
          price: 32.00,
          stock: 50,
          category: 'Stationery',
          image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 7,
          name: 'Velvet Accent Armchair',
          description: 'Deep emerald velvet fabric with brushed gold legs. Elegant mid-century style comfort for any living space or study.',
          price: 349.99,
          stock: 12,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 8,
          name: 'Solid Oak Coffee Table',
          description: 'Handcrafted solid white oak wood coffee table featuring clean joinery, minimalist lines, and a spacious lower storage shelf.',
          price: 219.00,
          stock: 8,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 9,
          name: 'Industrial Floor Arc Lamp',
          description: 'Sleek matte black steel floor lamp with an adjustable curved dome shade and a heavy, sturdy white marble base.',
          price: 159.00,
          stock: 14,
          category: 'Lighting',
          image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 10,
          name: 'Concrete Pendant Light',
          description: 'Industrial-chic cylindrical cast concrete pendant ceiling light with a beautifully textured raw gray finish.',
          price: 65.00,
          stock: 20,
          category: 'Lighting',
          image_url: 'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 11,
          name: 'Minimalist Mechanical Keyboard',
          description: 'Premium 65% wireless mechanical keyboard with quiet linear tactile switches, solid aluminum frame, and clean white LED backlighting.',
          price: 125.00,
          stock: 18,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 12,
          name: 'Smart Ambient Wake-Up Clock',
          description: 'Simulates natural sunrise to wake you up gently. Includes dynamic color cycles, guided breathing, nature soundscapes, and an FM radio.',
          price: 79.99,
          stock: 25,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 13,
          name: 'Classic Leather Cardholder',
          description: 'Ultra-slim card holder handcrafted from vegetable-tanned full-grain leather, featuring 4 card slots and a lined middle cash compartment.',
          price: 28.00,
          stock: 40,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 14,
          name: 'Stainless Steel Water Bottle',
          description: 'Double-wall vacuum insulated flask that keeps drinks icy cold for up to 24 hours or steaming hot for up to 12 hours. BPA-free design.',
          price: 35.00,
          stock: 35,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 15,
          name: 'Abstract Canvas Wall Art Set',
          description: 'Set of two textured monochrome abstract art prints on heavy gallery-wrapped canvas, framed in sustainable natural oak shadow boxes.',
          price: 95.00,
          stock: 10,
          category: 'Decor',
          image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 16,
          name: 'Scented Soy Wax Candle Set',
          description: 'Three hand-poured natural soy wax candles in minimalist jars. Aromatherapeutic scents: Sandalwood Amber, Fresh Lavender, and Wild Eucalyptus.',
          price: 38.50,
          stock: 22,
          category: 'Decor',
          image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 17,
          name: 'Sleek Brass Fountain Pen',
          description: 'Perfected weight-balanced solid brass fountain pen with a precision gold-plated German fine-point nib and reusable piston ink converter.',
          price: 55.00,
          stock: 15,
          category: 'Stationery',
          image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        },
        {
          id: 18,
          name: 'Minimalist Felt Desk Organizer Pad',
          description: 'Premium double-layered merino wool felt desk mat that protects your wood table, muffles typing sounds, and enables flawless optical mouse tracking.',
          price: 24.50,
          stock: 28,
          category: 'Stationery',
          image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
          created_at: new Date().toISOString()
        }
      ];
      data.products = seedProducts;
      writeData(data);
      console.log('Seeded default products to JSON database successfully.');
    }

    // Seed default admin user to JSON database if not exists
    const adminEmail = '2410030030cse@gmail.com';
    const adminExists = data.users.some((u: any) => u.email === adminEmail);
    if (!adminExists) {
      console.log('Seeding default admin user to JSON database...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Rohit2021', salt);
      const id = data.users.length > 0 ? Math.max(...data.users.map((u: any) => u.id)) + 1 : 1;
      data.users.push({
        id,
        name: 'Rohit Admin',
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
        created_at: new Date().toISOString()
      });
      writeData(data);
      console.log('Seeded default admin user to JSON database successfully.');
    }
    return;
  }

  console.log('Checking and initializing database tables...');
  try {
    const connection = await realPool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          stock INT DEFAULT 0,
          category VARCHAR(100),
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS newsletters (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      console.log('Database tables verified and ready.');

      // Check and seed default admin user to MySQL if not exists
      const adminEmail = '2410030030cse@gmail.com';
      const [userRows]: [any[], any] = await connection.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
      if (userRows.length === 0) {
        console.log('Seeding default admin user to MySQL...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Rohit2021', salt);
        await connection.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['Rohit Admin', adminEmail, passwordHash, 'admin']
        );
        console.log('Seeded default admin user to MySQL successfully.');
      }

      const [rows]: [any[], any] = await connection.query('SELECT COUNT(*) as count FROM products');
      if (rows[0] && rows[0].count === 0) {
        console.log('No products found in DB. Seeding default products...');
        const seedProducts = [
          [
            'Nordic Minimalist Lounge Chair',
            'Sleek wooden accents with premium wool blend cushions. Perfect for any modern living space or study.',
            299.99,
            15,
            'Furniture',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Aura Matte Desk Lamp',
            'Dimmable brass-finished table accessory with dynamic warm/cool light adjustments and wireless phone charging base.',
            89.50,
            24,
            'Lighting',
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Apex Noise-Cancelling Headphones',
            'Acoustically superior wireless over-ear headphones with custom spatial audio and up to 45 hours of battery life.',
            199.00,
            10,
            'Electronics',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Suede Travel Duffel Bag',
            'Waterproof full-grain suede exterior with a dedicated laptop compartment and shoe separation bag.',
            145.00,
            8,
            'Accessories',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Minimalist Ceramic Vase Set',
            'Set of three earthy matte terracotta vases in varying sizes to elevate bookshelves and mantelpieces.',
            45.00,
            30,
            'Decor',
            'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Bespoke Leather Notebook',
            'Refillable, rich brown leather cover containing hand-stitched 120GSM fountain-pen friendly cotton sheets.',
            32.00,
            50,
            'Stationery',
            'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Velvet Accent Armchair',
            'Deep emerald velvet fabric with brushed gold legs. Elegant mid-century style comfort for any living space or study.',
            349.99,
            12,
            'Furniture',
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Solid Oak Coffee Table',
            'Handcrafted solid white oak wood coffee table featuring clean joinery, minimalist lines, and a spacious lower storage shelf.',
            219.00,
            8,
            'Furniture',
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Industrial Floor Arc Lamp',
            'Sleek matte black steel floor lamp with an adjustable curved dome shade and a heavy, sturdy white marble base.',
            159.00,
            14,
            'Lighting',
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Concrete Pendant Light',
            'Industrial-chic cylindrical cast concrete pendant ceiling light with a beautifully textured raw gray finish.',
            65.00,
            20,
            'Lighting',
            'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Minimalist Mechanical Keyboard',
            'Premium 65% wireless mechanical keyboard with quiet linear tactile switches, solid aluminum frame, and clean white LED backlighting.',
            125.00,
            18,
            'Electronics',
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Smart Ambient Wake-Up Clock',
            'Simulates natural sunrise to wake you up gently. Includes dynamic color cycles, guided breathing, nature soundscapes, and an FM radio.',
            79.99,
            25,
            'Electronics',
            'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Classic Leather Cardholder',
            'Ultra-slim card holder handcrafted from vegetable-tanned full-grain leather, featuring 4 card slots and a lined middle cash compartment.',
            28.00,
            40,
            'Accessories',
            'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Stainless Steel Water Bottle',
            'Double-wall vacuum insulated flask that keeps drinks icy cold for up to 24 hours or steaming hot for up to 12 hours. BPA-free design.',
            35.00,
            35,
            'Accessories',
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Abstract Canvas Wall Art Set',
            'Set of two textured monochrome abstract art prints on heavy gallery-wrapped canvas, framed in sustainable natural oak shadow boxes.',
            95.00,
            10,
            'Decor',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Scented Soy Wax Candle Set',
            'Three hand-poured natural soy wax candles in minimalist jars. Aromatherapeutic scents: Sandalwood Amber, Fresh Lavender, and Wild Eucalyptus.',
            38.50,
            22,
            'Decor',
            'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Sleek Brass Fountain Pen',
            'Perfected weight-balanced solid brass fountain pen with a precision gold-plated German fine-point nib and reusable piston ink converter.',
            55.00,
            15,
            'Stationery',
            'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600'
          ],
          [
            'Minimalist Felt Desk Organizer Pad',
            'Premium double-layered merino wool felt desk mat that protects your wood table, muffles typing sounds, and enables flawless optical mouse tracking.',
            24.50,
            28,
            'Stationery',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'
          ]
        ];

        for (const p of seedProducts) {
          await connection.query(
            'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            p
          );
        }
        console.log('Seeded default products successfully.');
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    console.log('Falling back to local JSON database...');
    useMock = true;
    await initDatabase();
  }
}

const poolWrapper: any = {
  async query(sql: string, params?: any[]): Promise<[any, any]> {
    if (useMock) {
      return mockQueryExecutor(sql, params);
    }
    try {
      return await realPool.query(sql, params);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED') || err.message?.includes('Connection lost')) {
        console.error('MySQL connection lost/refused. Falling back to local JSON database.');
        useMock = true;
        await initDatabase();
        return mockQueryExecutor(sql, params);
      }
      throw err;
    }
  },

  async getConnection(): Promise<any> {
    if (useMock) {
      return new MockConnection();
    }
    try {
      const conn = await realPool.getConnection();
      return conn;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED') || err.message?.includes('Connection lost')) {
        console.error('MySQL connection lost/refused on getConnection. Falling back to local JSON database.');
        useMock = true;
        await initDatabase();
        return new MockConnection();
      }
      throw err;
    }
  }
};

export default poolWrapper;
