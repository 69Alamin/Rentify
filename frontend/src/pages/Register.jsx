import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield, Zap, AlertCircle, Loader } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userType: 'customer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password,
            user_type: formData.userType
        };

        try {
            const response = await fetch('/api/auth/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include' // Important for cross-origin session/cookies
            });

            const data = await response.json();

            if (data.success) {
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get('return');
                navigate(returnUrl || '/dashboard');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-24 pb-20">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row-reverse">

                {/* Form Side */}
                <div className="w-full md:w-1/2 p-10 md:p-12">
                    <div className="text-center md:text-left mb-10">
                        <h1 className="text-3xl font-bold text-secondary mb-2">Create Account</h1>
                        <p className="text-gray-500">Start your journey with flexible stays.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['customer', 'vendor', 'driver'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, userType: type })}
                                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${formData.userType === type
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="checkbox" required className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                            <span>I agree to the <a href="#" className="text-primary font-semibold">Terms of Service</a> & <a href="#" className="text-primary font-semibold">Privacy Policy</a></span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="font-bold text-secondary hover:underline">Sign In</Link>
                    </div>
                </div>

                {/* Feature Side */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary to-orange-600 text-white p-12 flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                    <div className="relative z-10 text-center">
                        <div className="inline-flex w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center mb-8 shadow-inner">
                            <Zap className="text-white w-10 h-10 fill-white" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Join the Revolution</h2>
                        <p className="text-white/90 text-lg leading-relaxed mb-8">
                            "Quickrent changed the way I travel. I save so much by booking only the hours I need!"
                        </p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-white opacity-50 first:opacity-100" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
