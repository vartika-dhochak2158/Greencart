import express from "express";
import cors from "cors";

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

app.get("/", (req, res) => {
    res.json({
        message: "GreenCart API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});