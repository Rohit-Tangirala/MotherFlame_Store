import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './server/routes/auth';
import productsRouter from './server/routes/products';
import ordersRouter from './server/routes/orders';
import newsletterRouter from './server/routes/newsletter';
import { initDatabase } from './server/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());

  // Initialize DB Tables and seed data
  await initDatabase();

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/newsletter', newsletterRouter);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Vite development server middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Production mode: Serving static files from dist/');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
