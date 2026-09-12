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


// ======================================================
// HELPER: CREATE DELIVERY TIMELINE
// ======================================================

const createDeliveryTimeline = (orderCreatedAt = new Date()) => {

    // Order placed
    const createdAt = new Date(orderCreatedAt);

    // Packed after 30-90 minutes
    const packedAt = new Date(
        createdAt.getTime() +
        (30 + Math.random() * 60) * 60 * 1000
    );

    // On the way 30-90 minutes after packed
    const onTheWayAt = new Date(
        packedAt.getTime() +
        (30 + Math.random() * 60) * 60 * 1000
    );

    // Delivered 60-180 minutes after on the way
    const deliveredAt = new Date(
        onTheWayAt.getTime() +
        (60 + Math.random() * 120) * 60 * 1000
    );

    return {
        createdAt,
        packedAt,
        onTheWayAt,
        deliveredAt
    };
};


// ======================================================
// PLACE ORDER COD
// /api/order/cod
// ======================================================

export const placeOrderCOD = async (req, res) => {

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


        // Calculate product prices from database
        for (const item of items) {

            let price = 0;


            // Check if product ID is a valid MongoDB ObjectId
            if (mongoose.Types.ObjectId.isValid(item.product)) {

                const product = await Product.findById(item.product);

                if (product) {

                    price = product.offerPrice || product.price;

                    validItems.push({
                        product: product._id,
                        quantity: item.quantity
                    });
                }
            }


            // Fallback for dummy/test items
            if (price === 0) {

                price =
                    item.price ||
                    item.offerPrice ||
                    10;


                validItems.push({
                    product: mongoose.Types.ObjectId.isValid(item.product)
                        ? item.product
                        : new mongoose.Types.ObjectId(),

                    quantity: item.quantity
                });
            }


            amount += price * item.quantity;
        }


        if (validItems.length === 0) {

            return res.json({
                success: false,
                message: "No valid products found"
            });
        }


        // 2% tax charge
        amount += Math.floor(amount * 0.02);


        // ==================================================
        // CREATE DELIVERY TIMELINE
        // ==================================================

        const timeline = createDeliveryTimeline();


        // ==================================================
        // CREATE COD ORDER
        // ==================================================

        await Order.create({

            userId: mongoose.Types.ObjectId.isValid(userId)
                ? userId
                : new mongoose.Types.ObjectId(),

            items: validItems,

            amount,

            address: mongoose.Types.ObjectId.isValid(address)
                ? address
                : new mongoose.Types.ObjectId(),

            status: "Order Placed",

            packedAt: timeline.packedAt,

            onTheWayAt: timeline.onTheWayAt,

            deliveredAt: timeline.deliveredAt,

            paymentType: "COD",

            isPaid: false,

            createdAt: timeline.createdAt
        });


        return res.json({
            success: true,
            message: "Order Placed Successfully"
        });


    } catch (error) {

        console.error("COD Order Error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};



// ======================================================
// CREATE RAZORPAY ORDER
// /api/order/razorpay
// ======================================================

export const createRazorpayOrder = async (req, res) => {

    try {

        const { userId, items, address } = req.body;


        console.log("========== RAZORPAY DEBUG ==========");
        console.log("USER ID:", userId);
        console.log(
            "ITEMS:",
            JSON.stringify(items, null, 2)
        );
        console.log(
            "ADDRESS:",
            JSON.stringify(address, null, 2)
        );
        console.log("====================================");


        if (!address || !items || items.length === 0) {

            return res.json({
                success: false,
                message: "Invalid order data"
            });
        }


        let amount = 0;
        const validItems = [];


        for (const item of items) {

            if (
                !item?.product ||
                !item?.quantity ||
                item.quantity <= 0
            ) {
                continue;
            }


            const product = await Product.findById(
                item.product
            );


            if (!product) {

                console.log(
                    "PRODUCT NOT FOUND:",
                    item.product
                );

                continue;
            }


            const price =
                product.offerPrice ||
                product.price;


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


        // 2% additional charge
        amount += Math.floor(amount * 0.02);


        // ==================================================
        // CREATE DELIVERY TIMELINE
        // ==================================================

        const timeline = createDeliveryTimeline();


        // ==================================================
        // CREATE DATABASE ORDER
        // ==================================================

        const order = await Order.create({

            userId,

            items: validItems,

            amount,

            address,

            status: "Order Placed",

            packedAt: timeline.packedAt,

            onTheWayAt: timeline.onTheWayAt,

            deliveredAt: timeline.deliveredAt,

            paymentType: "Online",

            isPaid: false,

            createdAt: timeline.createdAt
        });


        // ==================================================
        // CREATE RAZORPAY ORDER
        // ==================================================

        const razorpayOrder =
            await razorpay.orders.create({

                amount: Math.round(
                    amount * 100
                ),

                currency: "INR",

                receipt: order._id.toString()
            });


        return res.json({

            success: true,

            orderId: order._id,

            razorpayOrder
        });


    } catch (error) {

        console.error(
            "Razorpay Order Error:",
            error
        );


        return res.json({

            success: false,

            message: error.message
        });
    }
};



// ======================================================
// VERIFY RAZORPAY PAYMENT
// /api/order/razorpay/verify
// ======================================================

export const verifyRazorpayPayment = async (
    req,
    res
) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;


        const crypto =
            await import("crypto");


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res.json({

                success: false,

                message:
                    "Payment verification failed"
            });
        }


        const order =
            await Order.findById(orderId);


        if (!order) {

            return res.json({

                success: false,

                message: "Order not found"
            });
        }


        order.isPaid = true;

        await order.save();


        // Clear user's cart
        if (
            mongoose.Types.ObjectId.isValid(
                order.userId
            )
        ) {

            await User.findByIdAndUpdate(
                order.userId,
                {
                    cartItems: {}
                }
            );
        }


        return res.json({

            success: true,

            message:
                "Payment verified successfully"
        });


    } catch (error) {

        console.error(
            "Razorpay Verification Error:",
            error
        );


        return res.json({

            success: false,

            message: error.message
        });
    }
};



// ======================================================
// PLACE ORDER STRIPE
// /api/order/stripe
// ======================================================

export const placeOrderStripe = async (
    req,
    res
) => {

    try {

        const {
            userId,
            items,
            address
        } = req.body;


        const { origin } = req.headers;


        if (
            !address ||
            !items ||
            items.length === 0
        ) {

            return res.json({

                success: false,

                message:
                    "Invalid order data"
            });
        }


        let productData = [];

        let amount = 0;

        const validItems = [];


        for (const item of items) {

            let name = "Product Item";

            let price = 0;


            if (
                mongoose.Types.ObjectId.isValid(
                    item.product
                )
            ) {

                const product =
                    await Product.findById(
                        item.product
                    );


                if (product) {

                    name = product.name;

                    price =
                        product.offerPrice ||
                        product.price;


                    validItems.push({

                        product:
                        product._id,

                        quantity:
                        item.quantity
                    });
                }
            }


            // Fallback for dummy items
            if (price === 0) {

                name =
                    item.name ||
                    "Grocery Item";


                price =
                    item.price ||
                    item.offerPrice ||
                    10;


                validItems.push({

                    product:
                        mongoose.Types.ObjectId.isValid(
                            item.product
                        )
                            ? item.product
                            : new mongoose.Types.ObjectId(),

                    quantity:
                    item.quantity
                });
            }


            productData.push({

                name,

                price,

                quantity:
                item.quantity
            });


            amount +=
                price *
                item.quantity;
        }


        if (validItems.length === 0) {

            return res.json({

                success: false,

                message:
                    "No valid products found"
            });
        }


        // 2% tax charge
        amount += Math.floor(
            amount * 0.02
        );


        // ==================================================
        // CREATE DELIVERY TIMELINE
        // ==================================================

        const timeline =
            createDeliveryTimeline();


        // ==================================================
        // CREATE ORDER
        // ==================================================

        const order =
            await Order.create({

                userId,

                items: validItems,

                amount,

                address,

                status:
                    "Order Placed",

                packedAt:
                timeline.packedAt,

                onTheWayAt:
                timeline.onTheWayAt,

                deliveredAt:
                timeline.deliveredAt,

                paymentType:
                    "Stripe",

                isPaid: false,

                createdAt:
                timeline.createdAt
            });


        // ==================================================
        // STRIPE
        // ==================================================

        const stripeInstance =
            new stripe(
                process.env.STRIPE_SECRET_KEY
            );


        const line_items =
            productData.map(
                (item) => {

                    return {

                        price_data: {

                            currency:
                                "usd",

                            product_data: {

                                name:
                                item.name
                            },

                            unit_amount:
                                Math.round(
                                    (
                                        item.price +
                                        item.price *
                                        0.02
                                    ) * 100
                                )
                        },

                        quantity:
                        item.quantity
                    };
                }
            );


        const session =
            await stripeInstance
                .checkout
                .sessions
                .create({

                    line_items,

                    mode:
                        "payment",

                    success_url:
                        `${origin}/loader?next=my-orders`,

                    cancel_url:
                        `${origin}/cart`,

                    metadata: {

                        orderId:
                            order._id.toString(),

                        userId:
                            userId.toString()
                    }
                });


        return res.json({

            success: true,

            url:
            session.url
        });


    } catch (error) {

        console.error(
            "Stripe Order Error:",
            error
        );


        return res.json({

            success: false,

            message:
            error.message
        });
    }
};



// ======================================================
// STRIPE WEBHOOKS
// /stripe
// ======================================================

export const stripeWebhooks = async (
    request,
    response
) => {

    const stripeInstance =
        new stripe(
            process.env.STRIPE_SECRET_KEY
        );


    const sig =
        request.headers[
            "stripe-signature"
            ];


    let event;


    try {

        event =
            stripeInstance
                .webhooks
                .constructEvent(

                    request.body,

                    sig,

                    process.env
                        .STRIPE_WEBHOOK_SECRET
                );


    } catch (error) {

        return response
            .status(400)
            .send(
                `Webhook Error: ${error.message}`
            );
    }


    switch (event.type) {

        case "payment_intent.succeeded": {

            const paymentIntent =
                event.data.object;


            const session =
                await stripeInstance
                    .checkout.sessions
                    .list({

                        payment_intent:
                        paymentIntent.id
                    });


            if (
                session.data?.[0]?.metadata
            ) {

                const {
                    orderId,
                    userId
                } =
                    session
                        .data[0]
                        .metadata;


                await Order.findByIdAndUpdate(

                    orderId,

                    {
                        isPaid:
                            true
                    }
                );


                if (
                    mongoose.Types.ObjectId.isValid(
                        userId
                    )
                ) {

                    await User.findByIdAndUpdate(

                        userId,

                        {
                            cartItems: {}
                        }
                    );
                }
            }

            break;
        }


        case "payment_intent.payment_failed": {

            const paymentIntent =
                event.data.object;


            const session =
                await stripeInstance
                    .checkout.sessions
                    .list({

                        payment_intent:
                        paymentIntent.id
                    });


            if (
                session.data?.[0]?.metadata
            ) {

                const {
                    orderId
                } =
                    session
                        .data[0]
                        .metadata;


                await Order.findByIdAndDelete(
                    orderId
                );
            }

            break;
        }


        default:

            console.log(
                `Unhandled event type ${event.type}`
            );

            break;
    }


    response.json({
        received: true
    });
};



// ======================================================
// GET USER ORDERS
// /api/order/user
// ======================================================

export const getUserOrders = async (
    req,
    res
) => {

    try {

        const { userId } = req.body;


        const query = {

            userId,

            $or: [

                {
                    paymentType:
                        "COD"
                },

                {
                    isPaid:
                        true
                }

            ]
        };


        const orders =
            await Order.find(query)
                .populate(
                    "items.product"
                )
                .sort({
                    createdAt:
                        -1
                });


        // ==================================================
        // CALCULATE CURRENT STATUS
        // ==================================================

        const now =
            new Date();


        const updatedOrders =
            orders.map(
                (order) => {

                    const orderData =
                        order.toObject();


                    if (
                        order.deliveredAt &&
                        now >=
                        order.deliveredAt
                    ) {

                        orderData.status =
                            "Delivered";

                    }

                    else if (
                        order.onTheWayAt &&
                        now >=
                        order.onTheWayAt
                    ) {

                        orderData.status =
                            "On the way";

                    }

                    else if (
                        order.packedAt &&
                        now >=
                        order.packedAt
                    ) {

                        orderData.status =
                            "Packed";

                    }

                    else {

                        orderData.status =
                            "Order Placed";
                    }


                    return orderData;
                }
            );


        return res.json({

            success: true,

            orders:
            updatedOrders
        });


    } catch (error) {

        console.error(
            "Get User Orders Error:",
            error
        );


        return res.json({

            success: false,

            message:
            error.message
        });
    }
};



// ======================================================
// GET ALL ORDERS FOR SELLER
// /api/order/seller
// ======================================================

export const getAllOrders = async (
    req,
    res
) => {

    try {

        const orders =
            await Order.find({

                $or: [

                    {
                        paymentType:
                            "COD"
                    },

                    {
                        isPaid:
                            true
                    }

                ]

            })
                .populate(
                    "items.product address"
                )
                .sort({
                    createdAt:
                        -1
                });


        return res.json({

            success: true,

            orders
        });


    } catch (error) {

        return res.json({

            success: false,

            message:
            error.message
        });
    }
};