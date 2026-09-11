import React from 'react'
import {
  Package,
  Heart,
  UserRound,
  MapPin,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'

export default function Profile() {

  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    axios,
    backendUrl
  } = useAppContext()

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
          `${backendUrl}/api/user/logout`
      )

      if (data?.success) {
        setUser(null)
        navigate('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const accountCards = [
    {
      title: 'Your Orders',
      description: 'Track, view and manage your orders',
      icon: Package,
      action: () => navigate('/my-orders')
    },
    {
      title: 'Your Wishlist',
      description: 'View products you have saved',
      icon: Heart,
      action: () => navigate('/wishlist')
    },
    {
      title: 'Login & Security',
      description: 'Manage your account information',
      icon: UserRound,
      action: () => navigate('/login-security')
    },
    {
      title: 'Your Addresses',
      description: 'Manage your delivery addresses',
      icon: MapPin,
      action: () => navigate('/addresses')
    }
  ]

  return (
      <div className="min-h-[70vh] bg-slate-50 px-4 sm:px-8 py-8">

        <div className="max-w-5xl mx-auto">

          {/* Page Heading */}
          <h1 className="text-2xl font-black text-slate-900 mb-6">
            Profile
          </h1>

          {/* User Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-6">

            <div className="flex items-center gap-4">

              <div className="grid size-16 place-items-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-600">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {user?.name || 'Guest shopper'}
                </h2>

                <p className="text-sm text-slate-500">
                  {user?.email || 'Sign in to manage your account'}
                </p>

                {user && (
                    <p className="text-xs font-semibold text-emerald-600 mt-1">
                      GreenCart customer
                    </p>
                )}
              </div>

            </div>

          </div>

          {/* Account Cards */}
          {user ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {accountCards.map((card) => {

                    const Icon = card.icon

                    return (
                        <button
                            key={card.title}
                            type="button"
                            onClick={card.action}
                            className="group bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:border-emerald-200 transition"
                        >

                          <div className="flex items-start justify-between">

                            <div className="flex items-start gap-4">

                              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
                                <Icon className="size-6" />
                              </div>

                              <div>
                                <h3 className="font-black text-slate-800">
                                  {card.title}
                                </h3>

                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                  {card.description}
                                </p>
                              </div>

                            </div>

                            <ChevronRight className="size-5 text-slate-300 group-hover:text-emerald-600 transition shrink-0" />

                          </div>

                        </button>
                    )
                  })}

                </div>

                {/* Sign Out */}
                <div className="mt-6">
                  <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-black text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </>
          ) : (
              /* Guest */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">

                <div className="grid size-14 mx-auto place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                  <UserRound className="size-7" />
                </div>

                <h2 className="font-black text-slate-800">
                  Welcome to GreenCart
                </h2>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Sign in to view your orders, wishlist and account details.
                </p>

                <button
                    onClick={() => setShowUserLogin(true)}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 transition"
                >
                  Sign In
                </button>

              </div>
          )}

        </div>
      </div>
  )
}