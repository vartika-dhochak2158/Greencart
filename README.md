# 🛒 GreenCart — Full-Stack Grocery E-Commerce Platform

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

GreenCart is a modern, full-stack grocery e-commerce web application designed to provide a seamless online shopping experience. Users can browse products, manage their shopping cart and wishlist, save delivery addresses, and securely place orders with online payments integration via Razorpay.

---

## 🚀 Live Demo

- **Frontend Application:** [https://greencart-app-ruddy.vercel.app](https://greencart-app-ruddy.vercel.app)
- **Backend API:** [https://greencart-backend-e9yl.onrender.com](https://greencart-backend-e9yl.onrender.com)

---

## ✨ Key Features

### 👤 User Authentication
- **Secure Authentication:** User registration, login, and JWT-based session management.
- **OAuth Integration:** Google OAuth authentication for quick sign-ins.
- **Security:** Secure HTTP-only authentication cookies and persistent sessions.

### 🛍️ Shopping & Catalog
- Browse grocery products across multiple categories.
- Real-time product search and detailed view pages.
- Dynamic cart management (add, increase/decrease quantity, remove items).
- Wishlist functionality to save items for later.

### 📍 Address Management
- Add, edit, and delete multiple delivery addresses.
- Select saved addresses dynamically during checkout or add new ones inline.
- Automatic city/state lookup based on entered pin codes.

### 💳 Payments & Checkout
- Cash on Delivery (COD) support.
- Razorpay Test Mode integration for order creation and secure cryptographic signature verification.

### 📦 Orders & Tracking
- Complete order history tracking and status progression.
- View ordered products, order amount, and payment types.

### 🏪 Seller Panel
- Dedicated seller authentication.
- Order management system for sellers to track and view incoming customer orders.

---

## 🛠️ Tech Stack

### **Frontend**
- **React & Vite** — Fast component-based UI development
- **React Router** — Client-side routing
- **Tailwind CSS** — Responsive, utility-first styling
- **Axios** — HTTP client for API requests
- **Lucide React** — Modern UI icons
- **React Hot Toast** — Elegant notifications
- **@react-oauth/google** — Google login integration

### **Backend**
- **Node.js & Express.js** — RESTful API architecture
- **MongoDB & Mongoose** — NoSQL database and data modeling
- **JWT & bcryptjs** — Authentication and password hashing
- **Razorpay SDK** — Payment gateway handling
- **Google Auth Library** — Token verification

### **Cloud & Deployment**
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** MongoDB Atlas
- **Image Hosting:** Cloudinary

---

## 📁 Project Structure

```text
greencart/
├── client/                 # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Reusable UI components (Navbar, Login, etc.)
│   │   ├── context/        # React Context (AppContext)
│   │   ├── pages/          # Application views (Cart, Checkout, Profile, Orders)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
├── server/                 # Backend Node.js / Express Application
│   ├── configs/            # Database configurations (db.js)
│   ├── controllers/        # Route business logic handlers
│   ├── middlewares/        # Custom authentication middlewares (authUser, authSeller)
│   ├── models/             # Mongoose schemas (User, Product, Order, Address)
│   ├── routes/             # API routing endpoints
│   ├── seedProducts.js     # Database seeder script
│   ├── server.js           # Entry point
│   ├── package.json
│   └── .env
│
└── README.md
