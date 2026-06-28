# E-Commerce Web Application

> A full-stack e-commerce web application with role-based auth, product catalog, cart, checkout, and order tracking — backed by MySQL on Aiven and deployed on Render.

---

## Tech Stack

**Frontend**
- React (Vite)
- CSS Modules
- React Router v6
- Axios
- react-hot-toast

**Backend**
- Express.js
- jsonwebtoken
- bcryptjs
- mysql2
- multer
- resend
- cors, dotenv, nodemon

**Storage**
- Cloudinary — product image hosting

**Database**
- MySQL — Aiven (cloud-hosted)

**Deployment**
- Render

---

## Features

- JWT-based user authentication (register + login)
- Role-based access control (Admin / User)
- Product catalog with search, filter by category, price range, and pagination
- Product image upload via Cloudinary
- Add to cart with localStorage persistence
- Cart drawer with quantity controls and subtotal
- Checkout with order placement
- Stock management — decrements on order, disables Add to Cart at 0
- Order confirmation email via Resend
- User order history with status tracking
- Admin dashboard — manage products and orders
- Order status flow: pending → processing → shipped → delivered
- Skeleton loaders while products fetch
- Toast notifications for all key actions
- Fully responsive for mobile and desktop

---

## Project Structure

```
ecommerce/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   └── SkeletonCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageProducts.jsx
│   │   │       └── ManageOrders.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── server/                        # Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── middleware/
│   │   ├── verifyToken.js
│   │   └── isAdmin.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── seed.js                    # One-time admin seeder
│   └── index.js
├── .env
└── package.json
```

---

## API Routes

| Method | Route | Auth | Role | Action |
|--------|-------|------|------|--------|
| POST | `/api/auth/register` | ✗ | — | Register user |
| POST | `/api/auth/login` | ✗ | — | Return JWT |
| GET | `/api/products` | ✗ | — | Get all products |
| GET | `/api/products/:id` | ✗ | — | Get single product |
| POST | `/api/products` | ✓ | Admin | Create product |
| PUT | `/api/products/:id` | ✓ | Admin | Update product |
| DELETE | `/api/products/:id` | ✓ | Admin | Delete product |
| POST | `/api/orders` | ✓ | User | Place order |
| GET | `/api/orders` | ✓ | User | Get user's orders |
| GET | `/api/orders/all` | ✓ | Admin | Get all orders |
| PUT | `/api/orders/:id` | ✓ | Admin | Update order status |

---

## Deployment

- Frontend builds to `client/dist` via `npm run build`
- Express serves the React build as static files in production
- Hosted on **Render** (single service, one port)
- Database hosted on **Aiven** (MySQL 8.0)
- Images hosted on **Cloudinary**

---

## Made by Rohit