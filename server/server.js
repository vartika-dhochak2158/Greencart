import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";

import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import addressRoute from "./routes/addressRoute.js";
import sellerRoute from "./routes/sellerRoute.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://greencart-app-ruddy.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


// API ROUTES
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/address", addressRoute);
app.use("/api/seller", sellerRoute);


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "GreenCart API is running"
    });
});


const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});