import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Clock, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    const stats = [
        { label: 'Successful Stays', value: '25k+', icon: Clock, color: 'text-indigo-600' },
        { label: 'Partner Properties', value: '1,200+', icon: Globe, color: 'text-emerald-600' },
        { label: 'Verified Guests', value: '150k+', icon: Users, color: 'text-indigo-700' },
        { label: 'Satisfaction Score', value: '99.8%', icon: Award, color: 'text-primary' },
    ];

    const fadeIn = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-secondary overflow-hidden selection:bg-primary/10">
            {/* Ambient Polish */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 pt-32 pb-24">
                <div className="container mx-auto px-6">
                    {/* Hero Section */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <motion.div {...fadeIn}>
                            <span className="px-4 py-1.5 rounded-full bg-white shadow-sm text-[9px] font-black uppercase tracking-[0.2em] text-primary border border-gray-100 mb-6 inline-block">
                                The Modern Hospitality Standard
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-6 leading-tight text-secondary">
                                Flexibility <br />
                                <span className="text-primary prose-lg">Redefined.</span>
                            </h1>
                            <p className="text-base text-gray-500 font-bold leading-relaxed max-w-2xl mx-auto">
                                Quickrent isn't just a booking platform; it's a paradigm shift. We've dismantled the traditional 24-hour hotel model to give you absolute control over your time and space.
                            </p>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
                    >
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                                <stat.icon size={20} className={`${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                                <div className="text-2xl font-black mb-0.5 text-secondary italic"> {stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Core Mission Sections */}
                    <div className="space-y-20">
                        {/* Section 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                                    <Zap size={20} />
                                </div>
                                <h2 className="text-3xl font-black italic mb-4 tracking-tight text-secondary">Work-Life Efficiency.</h2>
                                <p className="text-gray-500 text-sm font-bold leading-relaxed mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    The global traveler is changing. Between layovers, remote work, and instant rest, the 24-hour check-in is a legacy of the past. Quickrent empowers you to unlock premium spaces for exactly as long as you need them—down to the hour.
                                </p>
                                <ul className="space-y-3">
                                    {['Transparent Hourly Pricing', 'Instant Mobile Check-in', 'Real-time Management'].map(item => (
                                        <li key={item} className="flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-gray-400">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <div className="relative">
                                <div className="aspect-video rounded-3xl bg-indigo-50 border border-indigo-100 p-1 shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Globe size={180} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 relative">
                                <div className="aspect-video rounded-3xl bg-secondary/5 border border-gray-100 p-1 shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Shield size={180} />
                                    </div>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-1 lg:order-2"
                            >
                                <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary mb-6 border border-gray-100">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-3xl font-black italic mb-4 tracking-tight text-secondary">Secured by Intelligence.</h2>
                                <p className="text-gray-500 text-sm font-bold leading-relaxed mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    Our proprietary verification engine ensures every property meets our standards in real-time. By analyzing stay history, visual data, and guest feedback, we ensure that every hour you spend in a Quickrent space meets a titanium standard of quality.
                                </p>
                                <ul className="space-y-3">
                                    {['Real-time Inventory Sync', 'Dynamic Quality Scores', 'Verified Host Ecosystem'].map(item => (
                                        <li key={item} className="flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-gray-400">
                                            <div className="w-2 h-2 rounded-full bg-secondary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>

                    {/* Join CTA */}
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-20 bg-secondary rounded-3xl p-12 text-center border border-gray-800 relative overflow-hidden text-white"
                    >
                        <h2 className="text-3xl md:text-5xl font-black italic mb-6 relative z-10">Ready for a <span className="text-primary italic">Paradigm Shift?</span></h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link to="/register" className="px-8 py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                                Create Account <ArrowRight size={16} />
                            </Link>
                            <Link to="/hotels" className="px-8 py-4 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/20 transition-all">
                                Explore Stays
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
