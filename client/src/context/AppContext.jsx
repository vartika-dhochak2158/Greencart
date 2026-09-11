import { createContext, useContext, useEffect, useState } from "react";
import { dummyProducts } from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Enable credentials for cookies/sessions if needed
axios.defaults.withCredentials = true;

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const currency = "₹";
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [products, setProducts] = useState(dummyProducts || []);
    const [cartItems, setCartItems] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [user, setUser] = useState(null);

    // 1. Wishlist state with localStorage persistence
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem("greencart_wishlist");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("greencart_wishlist", JSON.stringify(wishlist));
        } catch (error) {
            console.error("Failed to save wishlist to localStorage:", error);
        }
    }, [wishlist]);

    const toggleWishlist = (productId) => {
        const idStr = String(productId);
        setWishlist((prev) => {
            if (prev.includes(idStr)) {
                return prev.filter((id) => id !== idStr);
            } else {
                return [...prev, idStr];
            }
        });
    };

    // Check seller authentication on load
    const checkSellerAuth = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/seller/is-auth`);
            if (data?.success) {
                setIsSeller(true);
            }
        } catch {
            setIsSeller(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/product/list`);
            if (data?.success && Array.isArray(data?.products) && data.products.length > 0) {
                setProducts(data.products);
            } else {
                setProducts(dummyProducts || []);
            }
        } catch (err) {
            console.warn("Using fallback items:", err.message);
            setProducts(dummyProducts || []);
        }
    };

    const addToCart = (itemId) => {
        const cartData = structuredClone(cartItems);
        cartData[itemId] = (cartData[itemId] || 0) + 1;
        setCartItems(cartData);
        toast.success("Added to Cart");
    };

    const removeFromCart = (itemId) => {
        const cartData = structuredClone(cartItems);
        if (cartData[itemId] > 1) {
            cartData[itemId] -= 1;
        } else {
            delete cartData[itemId];
        }
        setCartItems(cartData);
    };

    const updateQuantity = (itemId, quantity) => {
        const cartData = structuredClone(cartItems);
        if (quantity <= 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalCount += cartItems[item];
            }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const itemInfo = products.find((product) => String(product._id) === String(itemId));
            if (itemInfo && cartItems[itemId] > 0) {
                totalAmount += (itemInfo.offerPrice || itemInfo.price || 0) * cartItems[itemId];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    };

    const checkUserAuth = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/is-auth`
            );

            if (data?.success) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log("Auth check failed:", error.message);
            setUser(null);
        }
    };
    useEffect(() => {
        fetchProducts();
        checkSellerAuth();
        checkUserAuth();
    }, []);

    const value = {
        axios,
        backendUrl,
        navigate,
        currency,
        products,
        setProducts,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        getCartAmount,
        wishlist,
        setWishlist,
        toggleWishlist,
        selectedCategory,
        setSelectedCategory,
        search,
        setSearch,
        searchQuery: search,
        setSearchQuery: setSearch,
        fetchProducts,
        showUserLogin,
        setShowUserLogin,
        isSeller,
        setIsSeller,
        user,
        setUser,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};


export const useAppContext = () => {
    return useContext(AppContext);
};

export default AppContextProvider;