import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";
import mongoose from "mongoose";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body;

        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Invalid order data" });
        }

        let amount = 0;
        const validItems = [];

        for (const item of items) {
            let price = 0;

            // Check if product ID is a valid MongoDB ObjectId
            if (mongoose.Types.ObjectId.isValid(item.product)) {
                const product = await Product.findById(item.product);
                if (product) {
                    price = product.offerPrice || product.price;
                    validItems.push({ product: product._id, quantity: item.quantity });
                }
            }

            // Fallback for dummy / test items
            if (price === 0) {
                price = item.price || item.offerPrice || 10;
                // If it's a dummy ID, generate a temporary ObjectId so Mongoose schema doesn't reject it
                validItems.push({
                    product: mongoose.Types.ObjectId.isValid(item.product)
                        ? item.product
                        : new mongoose.Types.ObjectId(),
                    quantity: item.quantity,
                });
            }

            amount += price * item.quantity;
        }

        // Add 2% Tax Charge
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId: mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(),
            items: validItems,
            amount,
            address: mongoose.Types.ObjectId.isValid(address) ? address : new mongoose.Types.ObjectId(),
            paymentType: "COD",
            isPaid: false,
        });

        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        console.error("COD Order Error:", error);
        return res.json({ success: false, message: error.message });
    }
};
// Create Razorpay Order : /api/order/razorpay
export const createRazorpayOrder = async (req, res) => {
    try {
        const { userId, items, address } = req.body;

        if (!address || !items || items.length === 0) {
            return res.json({
                success: false,
                message: "Invalid order data"
            });
        }

        let amount = 0;
        const validItems = [];

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                continue;
            }

            const product = await Product.findById(item.product);

            if (!product) {
                continue;
            }

            const price = product.offerPrice || product.price;

            amount += price * item.quantity;

            validItems.push({
                product: product._id,
                quantity: item.quantity
            });
        }

        if (validItems.length === 0) {
            return res.json({
                success: false,
                message: "No valid products found"
            });
        }

        // Add 2% platform/service charge
        amount += Math.floor(amount * 0.02);

        // Create our order in MongoDB
        const order = await Order.create({
            userId,
            items: validItems,
            amount,
            address,
            paymentType: "Online",
            isPaid: false,
        });

        // Razorpay expects amount in paise
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: order._id.toString(),
        });

        return res.json({
            success: true,
            orderId: order._id,
            razorpayOrder
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};
// Verify Razorpay Payment : /api/order/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const crypto = await import("crypto");

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.json({
                success: false,
                message: "Payment verification failed"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.json({
                success: false,
                message: "Order not found"
            });
        }

        order.isPaid = true;
        await order.save();

        // Clear user's cart
        if (mongoose.Types.ObjectId.isValid(order.userId)) {
            await User.findByIdAndUpdate(order.userId, {
                cartItems: {}
            });
        }

        return res.json({
            success: true,
            message: "Payment verified successfully"
        });

    } catch (error) {
        console.error("Razorpay Verification Error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};
// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        if (!address || !items || items.length === 0) {
            return res.json({ success: false, message: "Invalid order data" });
        }

        let productData = [];
        let amount = 0;
        const validItems = [];

        for (const item of items) {
            let name = "Product Item";
            let price = 0;

            if (mongoose.Types.ObjectId.isValid(item.product)) {
                const product = await Product.findById(item.product);
                if (product) {
                    name = product.name;
                    price = product.offerPrice || product.price;
                    validItems.push({ product: product._id, quantity: item.quantity });
                }
            }

            if (price === 0) {
                name = item.name || "Grocery Item";
                price = item.price || item.offerPrice || 10;
                validItems.push({
                    product: mongoose.Types.ObjectId.isValid(item.product)
                        ? item.product
                        : new mongoose.Types.ObjectId(),
                    quantity: item.quantity,
                });
            }

            productData.push({
                name,
                price,
                quantity: item.quantity,
            });

            amount += price * item.quantity;
        }

        // Add 2% Tax Charge
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId: mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(),
            items: validItems,
            amount,
            address: mongoose.Types.ObjectId.isValid(address) ? address : new mongoose.Types.ObjectId(),
            paymentType: "Online",
            isPaid: false,
        });

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round((item.price + item.price * 0.02) * 100),
                },
                quantity: item.quantity,
            };
        });

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId: userId.toString(),
            },
        });

        return res.json({ success: true, url: session.url });
    } catch (error) {
        console.error("Stripe Order Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id,
            });

            if (session.data?.[0]?.metadata) {
                const { orderId, userId } = session.data[0].metadata;
                await Order.findByIdAndUpdate(orderId, { isPaid: true });
                if (mongoose.Types.ObjectId.isValid(userId)) {
                    await User.findByIdAndUpdate(userId, { cartItems: {} });
                }
            }
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id,
            });

            if (session.data?.[0]?.metadata) {
                const { orderId } = session.data[0].metadata;
                await Order.findByIdAndDelete(orderId);
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
            break;
    }
    response.json({ received: true });
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const query = {
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        };
        if (mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
        }
        const orders = await Order.find(query)
            .populate("items.product address")
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Orders (for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        })
            .populate("items.product address")
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};