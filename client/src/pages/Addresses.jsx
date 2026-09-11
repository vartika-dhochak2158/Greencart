import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    MapPin,
    Plus,
    Pencil,
    Trash2,
    ArrowLeft,
    Home,
    Briefcase,
    MapPinned,
    Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const Addresses = () => {
    const {
        axios,
        backendUrl,
        user
    } = useAppContext()

    const navigate = useNavigate()

    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    // =========================================================
    // GET SAVED ADDRESSES
    // =========================================================

    const fetchAddresses = async () => {
        try {
            setLoading(true)

            const url = backendUrl
                ? `${backendUrl}/api/address/get`
                : '/api/address/get'

            const { data } = await axios.get(url, {
                withCredentials: true
            })

            if (data?.success) {
                setAddresses(data.addresses || [])
            } else {
                toast.error(
                    data?.message || 'Failed to load addresses'
                )
            }
        } catch (error) {
            console.error('Get addresses error:', error)

            toast.error(
                error.response?.data?.message ||
                'Failed to load addresses'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchAddresses()
        } else {
            setLoading(false)
        }
    }, [user])

    // =========================================================
    // DELETE ADDRESS
    // =========================================================

    const handleDelete = async (addressId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this address?'
        )

        if (!confirmed) return

        try {
            const url = backendUrl
                ? `${backendUrl}/api/address/delete`
                : '/api/address/delete'

            const { data } = await axios.delete(url, {
                data: {
                    addressId
                },
                withCredentials: true
            })

            if (data?.success) {
                toast.success('Address deleted')

                setAddresses((prev) =>
                    prev.filter(
                        (address) =>
                            address._id !== addressId
                    )
                )
            } else {
                toast.error(
                    data?.message ||
                    'Failed to delete address'
                )
            }
        } catch (error) {
            console.error(
                'Delete address error:',
                error
            )

            toast.error(
                error.response?.data?.message ||
                'Failed to delete address'
            )
        }
    }

    // =========================================================
    // ADDRESS ICON
    // =========================================================

    const getAddressIcon = (address) => {
        const street =
            `${address?.street || ''} ${address?.city || ''}`
                .toLowerCase()

        if (street.includes('office') || street.includes('work')) {
            return Briefcase
        }

        if (street.includes('home')) {
            return Home
        }

        return MapPinned
    }

    // =========================================================
    // NOT LOGGED IN
    // =========================================================

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">

                <div className="text-center space-y-4">

                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <MapPin className="size-8" />
                    </div>

                    <h2 className="text-xl font-black text-slate-800">
                        Sign in to view your addresses
                    </h2>

                    <p className="text-xs font-semibold text-slate-400">
                        Save your delivery addresses for faster checkout.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                        Go Home
                    </button>

                </div>

            </div>
        )
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">

                <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-xl bg-slate-100 animate-pulse" />

                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-52 rounded-3xl bg-slate-100 animate-pulse"
                        />
                    ))}

                </div>

            </div>
        )
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="min-h-[80vh] max-w-5xl mx-auto px-4 py-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition"
                    >
                        <ArrowLeft className="size-4" />
                    </button>

                    <div>

                        <h1 className="text-xl font-black text-slate-900">
                            Your Addresses
                        </h1>

                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            Manage your saved delivery addresses
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate('/add-address?mode=save')
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
                >
                    <Plus className="size-4" />
                    Add New Address
                </button>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {addresses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">

                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <MapPin className="size-8" />
                    </div>

                    <h2 className="mt-4 text-base font-black text-slate-800">
                        No saved addresses
                    </h2>

                    <p className="mx-auto mt-1 max-w-sm text-xs font-semibold text-slate-400">
                        Add your home, work, or other delivery
                        addresses so checkout is faster next time.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/add-address?mode=save')
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                        <Plus className="size-3.5" />
                        Add Your First Address
                    </button>

                </div>
            ) : (

                /* =================================================
                   ADDRESS CARDS
                ================================================= */

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {addresses.map((address, index) => {

                        const Icon =
                            getAddressIcon(address)

                        const fullName =
                            `${address.firstName || ''} ${address.lastName || ''}`
                                .trim()

                        return (
                            <div
                                key={address._id || index}
                                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-100 transition"
                            >

                                {/* Card Header */}

                                <div className="flex items-start justify-between gap-3">

                                    <div className="flex items-center gap-3">

                                        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <Icon className="size-5" />
                                        </div>

                                        <div>

                                            <p className="text-xs font-black text-slate-800">
                                                {index === 0
                                                    ? 'Saved Address'
                                                    : `Address ${index + 1}`
                                                }
                                            </p>

                                            <p className="text-[10px] font-semibold text-slate-400">
                                                Delivery address
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* Address Details */}

                                <div className="mt-4 space-y-1">

                                    <p className="text-sm font-black text-slate-800">
                                        {fullName || 'Customer'}
                                    </p>

                                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                        {address.street}
                                    </p>

                                    <p className="text-xs font-semibold text-slate-600">
                                        {address.city}, {address.state}
                                    </p>

                                    <p className="text-xs font-semibold text-slate-600">
                                        {address.zipcode}, {address.country || 'India'}
                                    </p>

                                </div>

                                {/* Contact */}

                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">

                                    {address.phone && (
                                        <p className="text-[11px] font-semibold text-slate-500">
                                            Phone: {address.phone}
                                        </p>
                                    )}

                                    {address.email && (
                                        <p className="text-[11px] font-semibold text-slate-500 truncate">
                                            {address.email}
                                        </p>
                                    )}

                                </div>

                                {/* Actions */}

                                <div className="flex items-center gap-2 mt-4">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate('/add-address?mode=edit', {
                                                state: {
                                                    address
                                                }
                                            })
                                        }
                                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition"
                                    >
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(address._id)
                                        }
                                        className="flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete
                                    </button>

                                </div>

                            </div>
                        )
                    })}

                </div>
            )}

        </div>
    )
}

export default Addresses