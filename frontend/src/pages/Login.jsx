import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../components/ui/Logo';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));

                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get('return') || location.state?.from?.pathname || location.state?.from;

                const user = data.user;
                if (user.user_type === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (user.user_type === 'vendor') {
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
            console.error(err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full font-sans bg-gray-100">
            {/* Main Card Container */}
            <div className="m-auto w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-10">
                    <h2 className="text-3xl font-black text-secondary mb-2">Welcome Back!</h2>
                    <p className="text-gray-400 font-medium mb-8">Sign in to manage your hourly stays.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="alamins@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-800 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400" size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-800 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-500 font-medium">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-bold text-primary hover:text-primary/80">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-secondary/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Side - Info Panel */}
                <div className="hidden md:flex w-1/2 bg-secondary p-10 flex-col justify-center items-center text-white relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10 text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-8 border border-primary/30">
                            <Logo size="small" />
                        </div>

                        <h3 className="text-2xl font-black mb-3">Secure & Flexible Booking</h3>
                        <p className="text-white/60 font-medium text-sm mb-10 max-w-xs mx-auto">
                            Join thousands of users who trust Quickrent for their short-term accommodation needs.
                        </p>

                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={18} className="text-primary" />
                                <span className="font-medium">Global Access</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={18} className="text-primary" />
                                <span className="font-medium">Instant Confirmation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={18} className="text-primary" />
                                <span className="font-medium">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
