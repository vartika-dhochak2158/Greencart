import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {
    useNavigate,
    useSearchParams,
    useLocation
} from 'react-router-dom'
import {
    CreditCard,
    Banknote,
    ShieldCheck,
    MapPin,
    ArrowLeft,
    Loader2,
    CheckCircle2
} from 'lucide-react'

const AddAddress = () => {

    const {
        axios,
        backendUrl,
        user,
        cartItems,
        products,
        setCartItems
    } = useAppContext()

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const location = useLocation()

    // =========================================================
    // MODES
    // =========================================================

    const mode = searchParams.get('mode')

    const isSaveMode = mode === 'save'
    const isEditMode = mode === 'edit'

    // Address passed from Addresses.jsx when editing
    const editingAddress = location.state?.address

    // =========================================================
    // STATES
    // =========================================================

    const [paymentMethod, setPaymentMethod] = useState('razorpay')

    const [isProcessing, setIsProcessing] = useState(false)

    const [isFetchingPincode, setIsFetchingPincode] = useState(false)

    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState('')
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

    // =========================================================
    // ADDRESS STATE
    // =========================================================

    const [address, setAddress] = useState({

        firstName:
            editingAddress?.firstName ||
            (user?.name
                ? user.name.split(' ')[0]
                : ''),

        lastName:
            editingAddress?.lastName ||
            (user?.name
                ? user.name.split(' ')[1] || ''
                : ''),

        email:
            editingAddress?.email ||
            user?.email ||
            '',

        street:
            editingAddress?.street ||
            '',

        city:
            editingAddress?.city ||
            '',

        state:
            editingAddress?.state ||
            '',

        zipcode:
            editingAddress?.zipcode ||
            '',

        country:
            editingAddress?.country ||
            'India',

        phone:
            editingAddress?.phone ||
            '',
    })

    // =========================================================
    // PINCODE
    // =========================================================
    useEffect(() => {
        if (!user || isSaveMode || isEditMode) return

        const fetchSavedAddresses = async () => {
            setIsLoadingAddresses(true)

            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/address/get`,
                    { withCredentials: true }
                )

                if (data?.success) {
                    setSavedAddresses(data.addresses || [])

                    // Automatically select the first saved address
                    if (data.addresses?.length > 0) {
                        setSelectedAddressId(data.addresses[0]._id)
                    }
                }
            } catch (error) {
                console.error(
                    'Fetch addresses error:',
                    error
                )
            } finally {
                setIsLoadingAddresses(false)
            }
        }

        fetchSavedAddresses()
    }, [user, isSaveMode, isEditMode])
    const fetchLocationByPincode = async (pincode) => {

        if (!/^\d{6}$/.test(pincode)) {
            return
        }

        setIsFetchingPincode(true)

        try {

            const response = await fetch(
                `https://api.postalpincode.in/pincode/${pincode}`
            )

            const data = await response.json()

            if (
                data &&
                data[0]?.Status === 'Success' &&
                data[0]?.PostOffice?.length > 0
            ) {

                const postOffice =
                    data[0].PostOffice[0]

                const city =
                    postOffice.District ||
                    postOffice.Block ||
                    postOffice.Name

                const state =
                    postOffice.State

                setAddress((prev) => ({
                    ...prev,
                    city,
                    state,
                }))

                toast.success(
                    `Location set: ${city}, ${state}`
                )

            } else {

                toast.error(
                    'Invalid PIN code. Please check or enter city/state manually.'
                )
            }

        } catch (error) {

            console.error(
                'Pincode API error:',
                error
            )

        } finally {

            setIsFetchingPincode(false)
        }
    }

    // =========================================================
    // INPUT HANDLER
    // =========================================================

    const onChangeHandler = (e) => {

        const {
            name,
            value
        } = e.target

        setAddress((prev) => ({
            ...prev,
            [name]: value
        }))

        if (name === 'zipcode') {

            const cleaned =
                value.trim()

            if (cleaned.length === 6) {

                fetchLocationByPincode(
                    cleaned
                )
            }
        }
    }

    // =========================================================
    // ORDER ITEMS
    // =========================================================

    const orderItems =
        Object.keys(cartItems || {})
            .map((productId) => {

                const product =
                    products.find(
                        (p) =>
                            String(
                                p._id || p.id
                            ) ===
                            String(productId)
                    )

                if (!product) {

                    console.log(
                        'PRODUCT NOT FOUND:',
                        productId
                    )

                    return null
                }

                const quantity =
                    Number(
                        cartItems[productId]
                    )

                if (quantity <= 0) {
                    return null
                }

                return {
                    product: String(
                        product._id || product.id
                    ),
                    quantity
                }
            })
            .filter(Boolean)

    // =========================================================
    // SUBMIT
    // =========================================================

    const onSubmitHandler = async (e) => {

        e.preventDefault()

        // -----------------------------------------------------
        // USER CHECK
        // -----------------------------------------------------

        if (!user) {

            toast.error(
                'Please log in first'
            )

            return
        }

        // =====================================================
        // EDIT ADDRESS MODE
        // =====================================================

        if (isEditMode) {

            if (!editingAddress?._id) {

                toast.error(
                    'Address information is missing'
                )

                return
            }

            setIsProcessing(true)

            try {

                const addressUrl =
                    backendUrl
                        ? `${backendUrl}/api/address/update`
                        : '/api/address/update'

                const { data } =
                    await axios.put(
                        addressUrl,
                        {
                            addressId:
                            editingAddress._id,

                            address
                        },
                        {
                            withCredentials:
                                true
                        }
                    )

                if (data?.success) {

                    toast.success(
                        'Address updated successfully! 🎉'
                    )

                    navigate(
                        '/addresses'
                    )

                } else {

                    toast.error(
                        data?.message ||
                        'Failed to update address'
                    )
                }

            } catch (error) {

                console.error(
                    'Update address error:',
                    error
                )

                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to update address'
                )

            } finally {

                setIsProcessing(false)
            }

            return
        }

        // =====================================================
        // SAVE ADDRESS ONLY MODE
        // =====================================================

        if (isSaveMode) {

            setIsProcessing(true)

            try {

                    const addressUrl =
                        backendUrl
                            ? `${backendUrl}/api/address/add`
                            : '/api/address/add'

                    const { data } =
                        await axios.post(
                            addressUrl,
                            {
                                address
                            },
                            {
                                withCredentials:
                                    true
                            }
                        )

                    if (data?.success) {

                        toast.success(
                            'Address saved successfully! 🎉'
                        )

                        navigate(
                            '/addresses'
                        )

                    } else {

                        toast.error(
                            data?.message ||
                            'Failed to save address'
                        )
                    }

                } catch (error) {

                    console.error(
                        'Save address error:',
                        error
                    )

                    toast.error(
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to save address'
                    )

                } finally {

                    setIsProcessing(false)
                }

                return
            }

        // =====================================================
        // NORMAL CHECKOUT MODE
        // =====================================================

        if (orderItems.length === 0) {

            toast.error(
                'Your cart is empty'
            )

            navigate('/cart')

            return
        }

        setIsProcessing(true)

        try {

            // =================================================
            // SAVE ADDRESS
            // =================================================

            let addressId

            if (selectedAddressId) {
                // Use the existing saved address
                addressId = selectedAddressId
            } else {
                // No saved address selected, so create a new one
                const addressUrl = backendUrl
                    ? `${backendUrl}/api/address/add`
                    : '/api/address/add'

                const { data: addressData } = await axios.post(
                    addressUrl,
                    { address },
                    { withCredentials: true }
                )

                if (!addressData.success) {
                    toast.error(
                        addressData.message ||
                        'Failed to save address'
                    )
                    setIsProcessing(false)
                    return
                }

                addressId = addressData.addressId
            }

            // =================================================
            // RAZORPAY
            // =================================================

            if (
                paymentMethod ===
                'razorpay'
            ) {

                // ---------------------------------------------
                // LOAD RAZORPAY SCRIPT
                // ---------------------------------------------

                if (!window.Razorpay) {

                    const script =
                        document.createElement(
                            'script'
                        )

                    script.src =
                        'https://checkout.razorpay.com/v1/checkout.js'

                    script.async = true

                    document.body.appendChild(
                        script
                    )

                    await new Promise(
                        (resolve, reject) => {

                            script.onload =
                                resolve

                            script.onerror =
                                reject
                        }
                    )
                }

                // ---------------------------------------------
                // CREATE RAZORPAY ORDER
                // ---------------------------------------------

                const url =
                    backendUrl
                        ? `${backendUrl}/api/order/razorpay`
                        : '/api/order/razorpay'

                const { data } =
                    await axios.post(
                        url,
                        {
                            address:
                            addressId,

                            items:
                            orderItems
                        },
                        {
                            withCredentials:
                                true
                        }
                    )

                if (!data.success) {

                    toast.error(
                        data.message ||
                        'Unable to start Razorpay payment'
                    )

                    setIsProcessing(false)

                    return
                }

                // ---------------------------------------------
                // RAZORPAY OPTIONS
                // ---------------------------------------------

                const options = {

                    key:
                    import.meta.env
                        .VITE_RAZORPAY_KEY_ID,

                    amount:
                    data.razorpayOrder.amount,

                    currency:
                    data.razorpayOrder.currency,

                    name:
                        'GreenCart',

                    description:
                        'Grocery Order',

                    order_id:
                    data.razorpayOrder.id,

                    // -----------------------------------------
                    // PAYMENT SUCCESS
                    // -----------------------------------------

                    handler:
                        async function (
                            response
                        ) {

                            try {

                                const verifyUrl =
                                    backendUrl
                                        ? `${backendUrl}/api/order/razorpay/verify`
                                        : '/api/order/razorpay/verify'

                                const {
                                    data:
                                        verifyData
                                } =
                                    await axios.post(
                                        verifyUrl,
                                        {
                                            razorpay_order_id:
                                            response.razorpay_order_id,

                                            razorpay_payment_id:
                                            response.razorpay_payment_id,

                                            razorpay_signature:
                                            response.razorpay_signature,

                                            orderId:
                                            data.orderId
                                        },
                                        {
                                            withCredentials:
                                                true
                                        }
                                    )

                                if (
                                    verifyData.success
                                ) {

                                    toast.success(
                                        'Payment successful! 🎉'
                                    )

                                    if (
                                        setCartItems
                                    ) {

                                        setCartItems(
                                            {}
                                        )
                                    }

                                    navigate(
                                        '/my-orders'
                                    )

                                } else {

                                    toast.error(
                                        verifyData.message ||
                                        'Payment verification failed'
                                    )
                                }

                            } catch (error) {

                                console.error(
                                    'Payment verification error:',
                                    error
                                )

                                toast.error(
                                    error.response?.data?.message ||
                                    'Payment verification failed'
                                )

                            } finally {

                                setIsProcessing(
                                    false
                                )
                            }
                        },

                    // -----------------------------------------
                    // PAYMENT MODAL CLOSED
                    // -----------------------------------------

                    modal: {

                        ondismiss:
                            function () {

                                setIsProcessing(
                                    false
                                )
                            }
                    },

                    // -----------------------------------------
                    // CUSTOMER DETAILS
                    // -----------------------------------------

                    prefill: {

                        name:
                            `${address.firstName} ${address.lastName}`
                                .trim(),

                        email:
                        address.email,

                        contact:
                        address.phone
                    },

                    theme: {

                        color:
                            '#059669'
                    }
                }

                // ---------------------------------------------
                // OPEN RAZORPAY
                // ---------------------------------------------

                const razorpay =
                    new window.Razorpay(
                        options
                    )

                razorpay.open()

            }

                // =================================================
                // CASH ON DELIVERY
            // =================================================

            else {

                const url =
                    backendUrl
                        ? `${backendUrl}/api/order/cod`
                        : '/api/order/cod'

                const { data } =
                    await axios.post(
                        url,
                        {
                            address:
                            addressId,

                            items:
                            orderItems
                        },
                        {
                            withCredentials:
                                true
                        }
                    )

                if (data.success) {

                    toast.success(
                        'Order placed successfully! 🎉'
                    )

                    if (setCartItems) {

                        setCartItems({})
                    }

                    navigate(
                        '/my-orders'
                    )

                } else {

                    toast.error(
                        data.message ||
                        'Failed to place order'
                    )

                    setIsProcessing(false)
                }
            }

        } catch (error) {

            console.error(
                'Order error:',
                error
            )

            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Payment initiation failed'
            )

            setIsProcessing(false)
        }
    }

    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">

            <form
                onSubmit={
                        onSubmitHandler
                }
                className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6"
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">

                    <div>

                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">

                            <MapPin className="size-5 text-emerald-600" />

                            {isEditMode ? (
                                'Edit Address'
                            ) : isSaveMode ? (
                                'Add New Address'
                            ) : (
                                <>
                                    Delivery &

                                    <span className="text-emerald-600">
                                        Payment
                                    </span>
                                </>
                            )}

                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">

                            {isEditMode
                                ? 'Update your saved delivery address'
                                : isSaveMode
                                    ? 'Save an address for faster checkout'
                                    : 'Enter your shipping destination and select a payment method'
                            }

                        </p>

                    </div>

                    {/* BACK BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                isEditMode
                                    ? '/addresses'
                                    : isSaveMode
                                        ? '/profile'
                                        : '/cart'
                            )
                        }
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >

                        <ArrowLeft className="size-3.5" />

                        {isEditMode
                            ? 'Back to Addresses'
                            : isSaveMode
                                ? 'Back to Profile'
                                : 'Back to Cart'
                        }

                    </button>

                </div>

                {/* =================================================
                    ADDRESS
                ================================================= */}

                <div className="space-y-3">

                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">

                        {isEditMode || isSaveMode
                            ? 'Address Details'
                            : '1. Shipping Address'
                        }

                    </p>
                    {!isSaveMode && !isEditMode && (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-500">
                                Choose a saved address
                            </p>

                            {isLoadingAddresses ? (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Loader2 className="size-4 animate-spin text-emerald-600" />
                                    Loading saved addresses...
                                </div>
                            ) : savedAddresses.length > 0 ? (
                                <div className="space-y-2">
                                    {savedAddresses.map((savedAddress) => (
                                        <button
                                            key={savedAddress._id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedAddressId(savedAddress._id)
                                            }
                                            className={`w-full text-left p-4 rounded-2xl border transition ${
                                                selectedAddressId === savedAddress._id
                                                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className="size-5 text-emerald-600 mt-0.5 shrink-0" />

                                                <div>
                                                    <p className="text-xs font-black text-slate-800">
                                                        {savedAddress.firstName}{' '}
                                                        {savedAddress.lastName}
                                                    </p>

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {savedAddress.street},{' '}
                                                        {savedAddress.city},{' '}
                                                        {savedAddress.state} -{' '}
                                                        {savedAddress.zipcode}
                                                    </p>

                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        {savedAddress.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    No saved addresses yet. Enter a new address below.
                                </p>
                            )}
                        </div>
                    )}

                    {/* NAME */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <input
                            type="text"
                            required={!selectedAddressId}
                            name="firstName"
                            value={
                                address.firstName
                            }
                            onChange={
                                onChangeHandler
                            }
                            placeholder="First Name"
                            autoComplete="given-name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />

                        <input
                            type="text"
                            required={!selectedAddressId}
                            name="lastName"
                            value={
                                address.lastName
                            }
                            onChange={
                                onChangeHandler
                            }
                            placeholder="Last Name"
                            autoComplete="family-name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />

                    </div>

                    {/* EMAIL + PHONE */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <input
                            type="email"
                            required={!selectedAddressId}
                            name="email"
                            value={
                                address.email
                            }
                            onChange={
                                onChangeHandler
                            }
                            placeholder="Email Address"
                            autoComplete="email"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />

                        <input
                            type="tel"
                            required={!selectedAddressId}
                            name="phone"
                            value={
                                address.phone
                            }
                            onChange={
                                onChangeHandler
                            }
                            placeholder="Phone Number"
                            autoComplete="tel"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />

                    </div>

                    {/* STREET */}

                    <input
                        type="text"
                        required={!selectedAddressId}
                        name="street"
                        value={
                            address.street
                        }
                        onChange={
                            onChangeHandler
                        }
                        placeholder="Street Address / House No. / Area"
                        autoComplete="street-address"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />

                    {/* PINCODE + CITY + STATE */}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                        {/* PINCODE */}

                        <div className="relative">

                            <input
                                type="text"
                                required={!selectedAddressId}
                                maxLength={6}
                                name="zipcode"
                                value={
                                    address.zipcode
                                }
                                onChange={
                                    onChangeHandler
                                }
                                placeholder="Pincode / Zip"
                                autoComplete="postal-code"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-8"
                            />

                            {isFetchingPincode && (

                                <Loader2
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-emerald-600"
                                />

                            )}

                            {!isFetchingPincode &&
                                address.city &&
                                address.zipcode.length === 6 && (

                                    <CheckCircle2
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600"
                                    />

                                )}

                        </div>

                        {/* CITY */}

                        <input
                            type="text"
                            required={!selectedAddressId}
                            name="city"
                            value={
                                address.city
                            }
                            onChange={
                                onChangeHandler
                            }
                            placeholder="City"
                            autoComplete="address-level2"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                        />

                        {/* STATE */}

                        <input
                            type="text"
                            required={!selectedAddressId}
                            name="state"
                            value={
                                address.state
                            }
                            onChange={
                                onChangeHandler
                            }
                            placeholder="State"
                            autoComplete="address-level1"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                        />

                    </div>

                </div>

                {/* =================================================
                    PAYMENT
                    ONLY CHECKOUT MODE
                ================================================= */}

                {!isSaveMode &&
                    !isEditMode && (

                        <div className="space-y-3 pt-2 border-t border-slate-100">

                            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                2. Payment Method
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                {/* RAZORPAY */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMethod(
                                            'razorpay'
                                        )
                                    }
                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                                        paymentMethod ===
                                        'razorpay'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >

                                    <CreditCard className="size-5 text-blue-600 shrink-0" />

                                    <div>

                                        <p className="text-xs font-black">
                                            Pay via Razorpay
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                            UPI, Cards, NetBanking
                                        </p>

                                    </div>

                                </button>

                                {/* COD */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMethod(
                                            'cod'
                                        )
                                    }
                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                                        paymentMethod ===
                                        'cod'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >

                                    <Banknote className="size-5 text-emerald-600 shrink-0" />

                                    <div>

                                        <p className="text-xs font-black">
                                            Cash on Delivery
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                            Pay cash upon item delivery
                                        </p>

                                    </div>

                                </button>

                            </div>

                        </div>
                    )}

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">

                    {/* LEFT MESSAGE */}

                    {isEditMode ? (

                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">

                            <MapPin className="size-4 text-emerald-600" />

                            <span>
                                Update your saved address
                            </span>

                        </div>

                    ) : !isSaveMode ? (

                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">

                            <ShieldCheck className="size-4 text-emerald-600" />

                            <span>
                                256-bit encrypted checkout
                            </span>

                        </div>

                    ) : (

                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">

                            <MapPin className="size-4 text-emerald-600" />

                            <span>
                                Your address is saved securely
                            </span>

                        </div>

                    )}

                    {/* SUBMIT BUTTON */}

                    <button
                        type="submit"
                        disabled={
                            isProcessing ||
                            isFetchingPincode
                        }
                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center justify-center gap-2"
                    >

                        {isProcessing ? (

                            <>
                                <Loader2 className="size-4 animate-spin" />

                                {isEditMode
                                    ? 'Updating address...'
                                    : isSaveMode
                                        ? 'Saving address...'
                                        : 'Processing order...'
                                }

                            </>

                        ) : isEditMode ? (

                            'Update Address'

                        ) : isSaveMode ? (

                            'Save Address'

                        ) : paymentMethod ===
                        'razorpay' ? (

                            'Pay with Razorpay'

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