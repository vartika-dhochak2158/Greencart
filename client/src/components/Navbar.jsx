import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Search,
    Bell,
    Heart,
    MapPin,
    ChevronDown,
    ShoppingCart,
    User,
    CheckCheck,
    PackageCheck,
    Percent,
    Sparkles,
    TrendingUp,
    X,
    ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const {
        user,
        setUser,
        axios,
        backendUrl,
        setShowUserLogin,
        getCartCount,
        search,
        setSearch,
        products = [],
        wishlist = []
    } = useAppContext();

    const [isFocused, setIsFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAddressMenu, setShowAddressMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('Home · Saved delivery address');

    // Filter live search suggestions based on typing
    const query = (search || '').trim().toLowerCase();
    const suggestions = query
        ? products
            .filter((p) => (p.name || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query))
            .slice(0, 5)
        : [];

    const popularTags = ['Organic veggies', 'Fresh Fruits', 'Dairy Products', 'Cold Drinks', 'Bakery'];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !searchInputRef.current?.contains(e.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Order Delivered 🎉',
            desc: 'Your grocery order was delivered to your address.',
            time: '5m ago',
            icon: PackageCheck,
            unread: true,
        },
        {
            id: 2,
            title: 'Special 20% OFF Deal',
            desc: 'Use coupon FRESH20 on fresh vegetables today.',
            time: '2h ago',
            icon: Percent,
            unread: true,
        },
        {
            id: 3,
            title: 'Bakery Batch Restocked',
            desc: 'Croissants and fresh artisanal bread are available.',
            time: '1d ago',
            icon: Sparkles,
            unread: false,
        },
    ]);

    const unreadCount = notifications.filter((n) => n.unread).length;

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        if (setSearch) setSearch(value);
    };

    const handleSelectSuggestion = (productName) => {
        if (setSearch) setSearch(productName);
        setIsFocused(false);
        navigate('/explore');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setIsFocused(false);
        navigate('/explore');
    };
    const handleLogout = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/logout`
            );

            if (data?.success) {
                setUser(null);
                setShowAccountMenu(false);
                navigate('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6">

                {/* 1. Logo */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <img src={assets?.logo || '/logo.svg'} alt="GreenCart" className="h-8 object-contain" />
                </Link>

                {/* 2. Deliver To Address Dropdown */}
                <div className="relative hidden md:block">
                    <button
                        type="button"
                        onClick={() => setShowAddressMenu(!showAddressMenu)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-left"
                    >
                        <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                            <MapPin className="size-4" />
                        </span>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Deliver to
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                <span className="max-w-[140px] truncate">{selectedAddress}</span>
                                <ChevronDown className="size-3 text-slate-400" />
                            </span>
                        </div>
                    </button>

                    {showAddressMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowAddressMenu(false)} />
                            <div className="absolute left-0 top-12 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-1">
                                {['Home · 123 Green Street, NY', 'Work · 88 Hudson Yards, NY', 'Gym · 12 Rivington Ave, NY'].map((addr, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedAddress(addr);
                                            setShowAddressMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-emerald-50 text-xs font-semibold text-slate-700"
                                    >
                                        <MapPin className="size-3.5 text-emerald-600" />
                                        {addr}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Search Bar with Live Suggestions Dropdown */}
                <div className="relative flex-1 max-w-md hidden sm:block">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <Search className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search || ''}
                            onFocus={() => setIsFocused(true)}
                            onChange={handleSearchChange}
                            placeholder="Search fresh groceries, bakery..."
                            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-slate-800"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 grid size-5 place-items-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </form>

                    {/* Suggestions Popup Menu */}
                    {isFocused && (
                        <div
                            ref={dropdownRef}
                            className="absolute left-0 right-0 top-12 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 space-y-3 animate-in fade-in"
                        >
                            {/* Matching items results */}
                            {query && suggestions.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                                        Matching Products
                                    </p>
                                    {suggestions.map((p) => (
                                        <button
                                            key={p._id || p.id}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(p.name)}
                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 text-left transition group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <img
                                                    src={Array.isArray(p.image) ? p.image[0] : p.image}
                                                    alt={p.name}
                                                    className="size-8 object-contain rounded-lg bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 truncate">{p.category}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 shrink-0">
                                                ₹{p.offerPrice || p.price}
                                            </span>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleSearchSubmit}
                                        className="w-full flex items-center justify-center gap-1.5 pt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 border-t border-slate-100 mt-2"
                                    >
                                        See all results for "{search}" <ArrowRight className="size-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* No matching results fallback */}
                            {query && suggestions.length === 0 && (
                                <div className="py-4 text-center text-xs font-medium text-slate-400">
                                    No products found for "{search}". Press Enter to view explore page.
                                </div>
                            )}

                            {/* Trending / Default tags when input is empty */}
                            {!query && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <TrendingUp className="size-3.5 text-emerald-600" />
                                        <span>Trending Searches</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 px-1">
                                        {popularTags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleSelectSuggestion(tag)}
                                                className="px-3 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-semibold border border-slate-200 transition"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Navigation Links */}
                <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
                    <Link to="/explore" className="hover:text-emerald-600 transition">Explore</Link>
                    <Link to="/wishlist" className="hover:text-emerald-600 transition">Wishlist</Link>
                    <Link to="/my-orders" className="hover:text-emerald-600 transition">Orders</Link>
                </div>

                {/* 5. Right Action Buttons */}
                <div className="flex items-center gap-2.5 sm:gap-3">

                    {/* Wishlist Button */}
                    <Link
                        to="/wishlist"
                        aria-label="Wishlist"
                        className="relative grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-500 transition shadow-sm"
                    >
                        <Heart className="size-4.5" />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart Icon */}
                    <Link
                        to="/cart"
                        aria-label="Cart"
                        className="relative grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition shadow-sm"
                    >
                        <ShoppingCart className="size-4.5" />
                        <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">
                            {getCartCount ? getCartCount() : 0}
                        </span>
                    </Link>

                    {/* Bell Notification Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notifications"
                            className="relative grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition shadow-sm active:scale-95"
                        >
                            <Bell className="size-4.5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Drawer */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl animate-in fade-in">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 text-sm">Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                                            >
                                                <CheckCheck className="size-3.5" /> Mark read
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {notifications.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-start gap-3 rounded-xl p-2.5 transition ${
                                                        item.unread ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                                                        <Icon className="size-4" />
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 leading-tight">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                                            {item.desc}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {item.time}
                                                        </span>
                                                    </div>
                                                    {item.unread && (
                                                        <span className="size-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Account Button */}
                    {!user ? (
                        <button
                            onClick={() =>
                                setShowUserLogin
                                    ? setShowUserLogin(true)
                                    : navigate('/login')
                            }
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition"
                        >
                            <User className="size-3.5" />
                            Login
                        </button>
                    ) : (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300 bg-white transition shadow-sm"
                            >
            <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : 'U'}
            </span>

                                <span className="text-xs font-bold text-slate-700">
                Account
            </span>

                                <ChevronDown
                                    className={`size-3.5 text-slate-400 transition-transform ${
                                        showAccountMenu ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {showAccountMenu && (
                                <>
                                    {/* Outside click */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowAccountMenu(false)}
                                    />

                                    {/* Account Dropdown */}
                                    <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">

                                        {/* User Info */}
                                        <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {user.name || 'User'}
                                            </p>

                                            <p className="text-[10px] text-slate-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* My Orders */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAccountMenu(false)
                                                navigate('/my-orders')
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                        >
                                            <PackageCheck className="size-4" />
                                            My Orders
                                        </button>

                                        {/* Sign Out */}
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 transition"
                                        >
                                            <ArrowRight className="size-4 rotate-180" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </header>
    );
}