import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Banknote, ShieldCheck, MapPin, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

const AddAddress = () => {
    const { axios, backendUrl, user, cartItems, products, setCartItems } = useAppContext()
    const navigate = useNavigate()

    const [paymentMethod, setPaymentMethod] = useState('stripe') // 'stripe' or 'cod'
    const [isProcessing, setIsProcessing] = useState(false)
    const [isFetchingPincode, setIsFetchingPincode] = useState(false)

    const [address, setAddress] = useState({
        firstName: user?.name ? user.name.split(' ')[0] : '',
        lastName: user?.name ? user.name.split(' ')[1] || '' : '',
        email: user?.email || '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        phone: '',
    })

    // Auto-fetch City and State when 6-digit PIN code is entered
    const fetchLocationByPincode = async (pincode) => {
        if (!/^\d{6}$/.test(pincode)) return

        setIsFetchingPincode(true)
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
            const data = await response.json()

            if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                const postOffice = data[0].PostOffice[0]
                const city = postOffice.District || postOffice.Block || postOffice.Name
                const state = postOffice.State

                setAddress((prev) => ({
                    ...prev,
                    city: city,
                    state: state,
                }))

                toast.success(`Location set: ${city}, ${state}`)
            } else {
                toast.error('Invalid PIN code. Please check or enter city/state manually.')
            }
        } catch {
            // Fallback silently if offline or API error
        } finally {
            setIsFetchingPincode(false)
        }
    }

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setAddress((prev) => ({ ...prev, [name]: value }))

        // Trigger PIN code lookup when 6 digits are typed
        if (name === 'zipcode') {
            const cleaned = value.trim()
            if (cleaned.length === 6) {
                fetchLocationByPincode(cleaned)
            }
        }
    }

    // Construct structured order items
    const orderItems = Object.keys(cartItems || {})
        .map((productId) => {
            const product = products.find((p) => String(p._id || p.id) === String(productId))
            if (!product || cartItems[productId] <= 0) return null
            return {
                product: product._id || product.id,
                name: product.name,
                price: Number(product.offerPrice || product.price || 0),
                quantity: cartItems[productId],
            }
        })
        .filter(Boolean)

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please log in first')
            return
        }

        if (orderItems.length === 0) {
            toast.error('Your cart is empty')
            navigate('/cart')
            return
        }

        setIsProcessing(true)

        try {
            if (paymentMethod === 'stripe') {
                const url = backendUrl ? `${backendUrl}/api/order/stripe` : '/api/order/stripe'
                const { data } = await axios.post(url, {
                    address,
                    items: orderItems,
                })

                if (data.success && data.session_url) {
                    window.location.replace(data.session_url)
                } else {
                    toast.error(data.message || 'Unable to start Stripe checkout session')
                    setIsProcessing(false)
                }
            } else {
                const url = backendUrl ? `${backendUrl}/api/order/cod` : '/api/order/cod'
                const { data } = await axios.post(url, {
                    address,
                    items: orderItems,
                }, {
                    withCredentials: true
                })

                if (data.success) {
                    toast.success('Order placed successfully! 🎉')
                    if (setCartItems) setCartItems({})
                    navigate('/my-orders')
                } else {
                    toast.error(data.message || 'Failed to place order')
                    setIsProcessing(false)
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Payment initiation failed')
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
            <form
                onSubmit={onSubmitHandler}
                className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <MapPin className="size-5 text-emerald-600" />
                            Delivery & <span className="text-emerald-600">Payment</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Enter your shipping destination and select a payment method
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft className="size-3.5" /> Back to Cart
                    </button>
                </div>

                {/* Address Inputs */}
                <div className="space-y-3">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">1. Shipping Address</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            required
                            name="firstName"
                            value={address.firstName}
                            onChange={onChangeHandler}
                            placeholder="First Name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                            type="text"
                            required
                            name="lastName"
                            value={address.lastName}
                            onChange={onChangeHandler}
                            placeholder="Last Name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="email"
                            required
                            name="email"
                            value={address.email}
                            onChange={onChangeHandler}
                            placeholder="Email Address"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                            type="tel"
                            required
                            name="phone"
                            value={address.phone}
                            onChange={onChangeHandler}
                            placeholder="Phone Number"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <input
                        type="text"
                        required
                        name="street"
                        value={address.street}
                        onChange={onChangeHandler}
                        placeholder="Street Address / House No. / Area"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* PIN Code / Zip (Triggers Auto-Fill) */}
                        <div className="relative">
                            <input
                                type="text"
                                required
                                maxLength={6}
                                name="zipcode"
                                value={address.zipcode}
                                onChange={onChangeHandler}
                                placeholder="Pincode / Zip (6 digits)"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-8"
                            />
                            {isFetchingPincode && (
                                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-emerald-600" />
                            )}
                            {!isFetchingPincode && address.city && address.zipcode.length === 6 && (
                                <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600" />
                            )}
                        </div>

                        {/* City (Auto-filled) */}
                        <input
                            type="text"
                            required
                            name="city"
                            value={address.city}
                            onChange={onChangeHandler}
                            placeholder="City"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                        />

                        {/* State (Auto-filled) */}
                        <input
                            type="text"
                            required
                            name="state"
                            value={address.state}
                            onChange={onChangeHandler}
                            placeholder="State"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                        />
                    </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">2. Payment Method</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Stripe Option */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('stripe')}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                                paymentMethod === 'stripe'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <CreditCard className="size-5 text-indigo-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black">Pay via Stripe</p>
                                <p className="text-[10px] text-slate-400">Credit / Debit Card, NetBanking</p>
                            </div>
                        </button>

                        {/* COD Option */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('cod')}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                                paymentMethod === 'cod'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <Banknote className="size-5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black">Cash on Delivery</p>
                                <p className="text-[10px] text-slate-400">Pay cash upon item delivery</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <span>256-bit encrypted checkout</span>
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing || isFetchingPincode}
                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="size-4 animate-spin" /> Processing order...
                            </>
                        ) : paymentMethod === 'stripe' ? (
                            'Pay with Stripe'
                        ) : (
                            'Place Order (COD)'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddAddress