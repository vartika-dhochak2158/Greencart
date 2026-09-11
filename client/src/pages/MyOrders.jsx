import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
    Package,
    Clock,
    PackageCheck,
    Bike,
    Home,
    ChevronRight,
    ShoppingBag
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'

const MotionDiv = motion.div

const statusSteps = [
    { label: 'Placed', icon: Clock, timeKey: 'createdAt' },
    { label: 'Packed', icon: PackageCheck, timeKey: 'packedAt' },
    { label: 'On the way', icon: Bike, timeKey: 'onTheWayAt' },
    { label: 'Delivered', icon: Home, timeKey: 'deliveredAt' },
]

function getStepIndex(status) {
    const s = (status || '').toLowerCase()

    if (s.includes('deliver')) return 3
    if (s.includes('way') || s.includes('out') || s.includes('transit')) return 2
    if (s.includes('pack') || s.includes('process')) return 1

    return 0
}

function formatDateTime(date) {
    if (!date) return ''

    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

export default function MyOrders() {
    const { user, axios, backendUrl } = useAppContext()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const url = backendUrl
                ? `${backendUrl}/api/order/user`
                : '/api/order/user'

            const { data } = await axios.get(url)

            if (data?.success) {
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()

        // Check status every minute
        const interval = setInterval(fetchOrders, 60 * 1000)

        return () => clearInterval(interval)
    }, [user, axios, backendUrl])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
                <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
                <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
            </div>
        )
    }

    if (!orders.length) {
        return (
            <MotionDiv
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4"
            >
                <div className="grid size-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600 mx-auto">
                    <ShoppingBag className="size-10" />
                </div>

                <h2 className="text-xl font-black text-slate-800">
                    No orders yet
                </h2>

                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                    You have not placed any orders yet. Start shopping fresh essentials now.
                </p>

                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition active:scale-95 shadow-sm"
                >
                    Explore Groceries
                    <ChevronRight className="size-3.5" />
                </Link>
            </MotionDiv>
        )
    }

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-6 space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900">
                    My Orders
                </h1>

                <span className="text-xs font-bold text-slate-500">
                    {orders.length} orders placed
                </span>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const currentStep = getStepIndex(order.status)

                    return (
                        <div
                            key={order._id}
                            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-5"
                        >
                            {/* Order Top Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 font-semibold">
                                        Order ID:{' '}
                                    </span>

                                    <span className="font-bold text-slate-800">
                                        #{order._id?.slice(-8)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 font-semibold">
                                        {order.createdAt
                                            ? formatDateTime(order.createdAt)
                                            : 'Recent'}
                                    </span>

                                    <span className="font-black text-emerald-600 text-sm">
                                        ₹{order.amount}
                                    </span>
                                </div>
                            </div>

                            {/* Order Status Stepper */}
                            <div className="py-2">
                                <div className="relative flex items-start justify-between">

                                    {/* Progress Line */}
                                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100 -z-0">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-500"
                                            style={{
                                                width: `${(currentStep / (statusSteps.length - 1)) * 100}%`
                                            }}
                                        />
                                    </div>

                                    {statusSteps.map((step, idx) => {
                                        const Icon = step.icon
                                        const isDone = idx <= currentStep
                                        const isCurrent = idx === currentStep

                                        const stepTime = order[step.timeKey]

                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center gap-1.5 z-10"
                                            >
                                                {/* Icon */}
                                                <div
                                                    className={`grid size-8 place-items-center rounded-full border-2 transition-all ${
                                                        isDone
                                                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-400'
                                                    } ${
                                                        isCurrent
                                                            ? 'ring-4 ring-emerald-100'
                                                            : ''
                                                    }`}
                                                >
                                                    <Icon className="size-4" />
                                                </div>

                                                {/* Label */}
                                                <span
                                                    className={`text-[10px] font-bold ${
                                                        isDone
                                                            ? 'text-emerald-700'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {step.label}
                                                </span>

                                                {/* Date & Time */}
                                                {stepTime && (
                                                    <span className="text-[8px] font-semibold text-slate-400 text-center whitespace-nowrap">
                                                        {formatDateTime(stepTime)}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Items in this Order */}
                            <div className="space-y-2 pt-2">
                                {order.items?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-8 rounded-lg bg-slate-50 border border-slate-100 grid place-items-center font-bold text-slate-400 text-[10px]">
                                                {item.quantity}x
                                            </div>

                                            <span className="font-bold text-slate-700">
                                                {item.product?.name ||
                                                    item.name ||
                                                    'Grocery Item'}
                                            </span>
                                        </div>

                                        <span className="font-bold text-slate-900">
                                            ₹
                                            {((
                                                item.product?.offerPrice ||
                                                item.product?.price ||
                                                0
                                            ) * (item.quantity || 1))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </MotionDiv>
    )
}