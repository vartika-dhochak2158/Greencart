import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [currState, setCurrState] = useState('Sign Up');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { axios, backendUrl, setShowUserLogin, setUser } = useAppContext();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            if (currState === 'Sign Up') {
                const { data } = await axios.post(`${backendUrl}/api/user/register`, {
                    name,
                    email,
                    password,
                });

                if (data.success) {
                    setUser(data.user || { name, email });
                    setShowUserLogin(false);
                    toast.success("Account created successfully!");
                } else {
                    toast.error(data.message || "Failed to create account");
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/user/login`, {
                    email,
                    password,
                });

                if (data.success) {
                    setUser(data.user || { email });
                    setShowUserLogin(false);
                    toast.success("Logged in successfully!");
                } else {
                    toast.error(data.message || "Invalid credentials");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <form
                onSubmit={onSubmitHandler}
                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => setShowUserLogin(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                    ✕
                </button>

                {/* Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        <span className="text-emerald-600">User</span> {currState}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {currState === 'Sign Up'
                            ? 'Create an account to track orders & checkout fast'
                            : 'Sign in to access your saved addresses & orders'}
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                    {currState === 'Sign Up' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition"
                        />
                    </div>
                </div>

                {/* State Toggle */}
                <div className="text-xs text-gray-500 text-center">
                    {currState === 'Sign Up' ? (
                        <p>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setCurrState('Login')}
                                className="text-emerald-600 font-semibold hover:underline"
                            >
                                click here
                            </button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setCurrState('Sign Up')}
                                className="text-emerald-600 font-semibold hover:underline"
                            >
                                click here
                            </button>
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-md transition duration-200"
                >
                    {currState === 'Sign Up' ? 'Create Account' : 'Login'}
                </button>
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            console.log("GOOGLE RESPONSE:", credentialResponse);

                            try {
                                const { data } = await axios.post(
                                    `${backendUrl}/api/user/google`,
                                    {
                                        credential: credentialResponse.credential
                                    },
                                    {
                                        withCredentials: true
                                    }
                                );

                                if (data.success) {
                                    setUser(data.user);
                                    setShowUserLogin(false);
                                    toast.success("Logged in with Google!");
                                } else {
                                    toast.error(
                                        data.message ||
                                        "Google login failed"
                                    );
                                }
                            } catch (error) {
                                console.error(
                                    "Google login error:",
                                    error
                                );

                                toast.error(
                                    error.response?.data?.message ||
                                    "Google login failed"
                                );
                            }
                        }}
                        onError={() => {
                            toast.error("Google login failed");
                        }}
                    />
                </div>
            </form>
        </div>
    );
};

export default Login;