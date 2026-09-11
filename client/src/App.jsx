import React, { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { useAppContext } from './context/AppContext';

// Shell & Global Components
import AppShell from './components/AppShell';
import Login from './components/Login';
import Loading from './components/Loading';

// Storefront Pages
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import LoginSecurity from './pages/LoginSecurity';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import ManageAddress from './pages/ManageAddress';


// Seller Portal Pages
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';

// Helper component to reset scroll position on route change
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

const App = () => {
    const { pathname } = useLocation();
    const isSellerPath = pathname.startsWith('/seller');
    const { showUserLogin, isSeller } = useAppContext();

    return (
        <div className="text-default min-h-screen text-slate-800 bg-white selection:bg-emerald-100 selection:text-emerald-800">
            <ScrollToTop />
            {showUserLogin && <Login />}

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: '16px',
                        background: '#0f172a',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                    },
                }}
            />

            {isSellerPath ? (
                /* Seller View */
                <Routes>
                    <Route
                        path="/seller"
                        element={isSeller ? <SellerLayout /> : <SellerLogin />}
                    >
                        <Route index element={isSeller ? <AddProduct /> : <Navigate to="/seller" replace />} />
                        <Route path="product-list" element={<ProductList />} />
                        <Route path="orders" element={<Orders />} />
                    </Route>
                    <Route path="/seller/*" element={<Navigate to="/seller" replace />} />
                </Routes>
            ) : (
                /* Customer Store View */
                <AppShell>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<AllProducts />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/addresses" element={<Addresses />} />
                        <Route path="/addresses" element={<ManageAddress />} />
                        <Route path="/login-security" element={<LoginSecurity />} />
                        <Route path="/products/:category" element={<ProductCategory />} />
                        <Route path="/products/:category/:id" element={<ProductDetails />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/add-address" element={<AddAddress />} />
                        <Route path="/my-orders" element={<MyOrders />} />
                        <Route path="/loader" element={<Loading />} />

                        {/* Catch-all fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppShell>
            )}
        </div>
    );
};

export default App;