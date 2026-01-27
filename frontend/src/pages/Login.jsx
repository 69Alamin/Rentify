import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, CheckCircle, Shield, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important: persist session cookie
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirection Logic
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get('return') || location.state?.from?.pathname;

                if (returnUrl) {
                    navigate(returnUrl, { replace: true });
                } else if (data.user.type === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.user.type === 'vendor') {
                    navigate('/vendor/dashboard');
                } else if (data.user.type === 'driver') {
                    navigate('/driver/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-24 pb-20">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Form Side */}
                <div className="w-full md:w-1/2 p-10 md:p-12">
                    <div className="text-center md:text-left mb-10">
                        <h1 className="text-3xl font-bold text-secondary mb-2">Welcome Back!</h1>
                        <p className="text-gray-500">Sign in to manage your hourly stays.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="font-semibold text-primary hover:text-primary-hover">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white font-bold py-3.5 rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account? <Link to={`/register${window.location.search}`} className="font-bold text-primary hover:underline">Create Account</Link>
                    </div>
                </div>

                {/* Feature Side */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-secondary to-dark text-white p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -ml-16 -mb-16" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-8">
                            <Shield className="text-primary" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Secure & Flexible Booking</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Join thousands of users who trust Quickrent for their short-term accommodation needs.
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {['Global Access', 'Instant Confirmation', '24/7 Support'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <CheckCircle className="text-primary" size={20} />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
