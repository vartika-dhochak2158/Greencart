import React, { useEffect, useState } from 'react'
import { MapPin, Plus, ChevronLeft, Check } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const ManageAddress = () => {
    const {
        axios,
        backendUrl,
        navigate
    } = useAppContext()

    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/address/get`
            )

            if (data?.success) {
                setAddresses(data.addresses || [])
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    return (
        <div className="min-h-[75vh] bg-slate-50 px-4 sm:px-8 py-8">

            <div className="max-w-4xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-6"
                >
                    <ChevronLeft className="size-4" />
                    Back to Profile
                </button>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            Your Addresses
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage your saved delivery addresses
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/add-address?mode=save')}
                        className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                        <Plus className="size-4" />
                        Add New Address
                    </button>

                </div>

                {/* Loading */}
                {loading ? (

                    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
                        <p className="text-sm font-semibold text-slate-400">
                            Loading your addresses...
                        </p>
                    </div>

                ) : addresses.length === 0 ? (

                    /* Empty */
                    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">

                        <div className="grid size-16 mx-auto place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                            <MapPin className="size-7" />
                        </div>

                        <h2 className="font-black text-slate-800">
                            No saved addresses
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 mb-5">
                            Save an address to make checkout faster.
                        </p>

                        <button
                            onClick={() => navigate('/add-address?mode=save')}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                            <Plus className="size-4" />
                            Add Address
                        </button>

                    </div>

                ) : (

                    /* Addresses */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {addresses.map((address, index) => (

                            <div
                                key={address._id || index}
                                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition"
                            >

                                <div className="flex items-start gap-4">

                                    {/* Icon */}
                                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <MapPin className="size-5" />
                                    </div>

                                    {/* Address */}
                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-slate-800">
                                                {address.firstName} {address.lastName}
                                            </h3>

                                            {index === 0 && (
                                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                                                    <Check className="size-3" />
                                                    Saved
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-600 mt-2">
                                            {address.street}
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            {address.city}, {address.state}
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            {address.zipcode}, {address.country}
                                        </p>

                                        {address.phone && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                Phone: {address.phone}
                                            </p>
                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>
        </div>
    )
}

export default ManageAddress