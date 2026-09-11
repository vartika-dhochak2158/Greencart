import React from 'react'
import { UserRound, Mail, ShieldCheck, ChevronLeft } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

export default function LoginSecurity() {

    const { user, navigate } = useAppContext()

    return (
        <div className="min-h-[70vh] bg-slate-50 px-4 sm:px-8 py-8">

            <div className="max-w-5xl mx-auto">

                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-5"
                >
                    <ChevronLeft className="size-4" />
                    Back to Profile
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-black text-slate-900">
                        Login & Security
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Manage your GreenCart account information
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Name */}
                    <div className="flex items-center justify-between gap-4 p-5 border-b border-slate-100">

                        <div className="flex items-center gap-4">

                            <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                                <UserRound className="size-5" />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">
                                    Name
                                </p>

                                <p className="font-bold text-slate-800 mt-1">
                                    {user?.name || 'Not available'}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between gap-4 p-5 border-b border-slate-100">

                        <div className="flex items-center gap-4">

                            <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Mail className="size-5" />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">
                                    Email
                                </p>

                                <p className="font-bold text-slate-800 mt-1">
                                    {user?.email || 'Not available'}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Security */}
                    <div className="flex items-center gap-4 p-5">

                        <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="size-5" />
                        </div>

                        <div>
                            <p className="font-bold text-slate-800">
                                Account security
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                Your account is protected with secure authentication.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}