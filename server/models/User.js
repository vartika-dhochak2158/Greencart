import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: false
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    cartItems: {
        type: Object,
        default: {}
    },

}, { minimize: false });

const User =
    mongoose.models.user ||
    mongoose.model('user', userSchema);

export default User;