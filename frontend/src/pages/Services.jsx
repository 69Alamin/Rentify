import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Utensils, Navigation, Shield, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
    const services = [
        {
            icon: Clock,
            title: "Dynamic Hourly Stays",
            desc: "Rent premium spaces by the hour with no fixed check-in times. Pay only for the time you use.",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            link: "/hotels"
        },
        {
            icon: Shield,
            title: "Immediate Sanctuary",
            desc: "Priority discovery. Our protocol finds and secures the nearest verified safe-room in high-stress situations.",
            color: "text-red-600",
            bg: "bg-red-50",
            link: "/hotels"
        },
        {
            icon: Utensils,
            title: "Premium Dining",
            desc: "Gourmet dining synced to your check-in. Order premium meals through our vendor network directly to your stay.",
            color: "text-orange-600",
            bg: "bg-orange-50",
            link: "/food"
        },
        {
            icon: Navigation,
            title: "Alternative Journey",
            desc: "Seamlessly connect stays with transit via our trusted driver ecosystem for perfect travel synchronization.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            link: "/journey"
        },
        {
            icon: Shield,
            title: "Safety Verification",
            desc: "Real-time auditing. Every space is verified for safety, hygiene, and reliability before your arrival.",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            link: "/admin/analytics"
        },
        {
            icon: MapPin,
            title: "Spatial Explorer",
            desc: "Hyper-local discovery. Use our interactive map to find the perfect rest-stop or workspace exactly where you are.",
            color: "text-primary",
            bg: "bg-primary/5",
            link: "/map"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-secondary pt-32 pb-24 overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-white shadow-sm text-[9px] font-black uppercase tracking-[0.2em] text-primary border border-gray-100 mb-6 inline-block">
                            Platform Capabilities
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-6 leading-tight text-secondary">
                            The <span className="text-primary prose-lg">Aura</span> Ecosystem.
                        </h1>
                        <p className="text-base text-gray-500 font-bold leading-relaxed opacity-80">
                            Discover the professional-grade services engineered to redefine your relationship with time and space.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-105 transition-transform duration-500 text-secondary">
                                <service.icon size={100} />
                            </div>

                            <div className={`w-10 h-10 ${service.bg} rounded-xl flex items-center justify-center ${service.color} mb-4 border border-gray-100/50`}>
                                <service.icon size={18} />
                            </div>

                            <h3 className="text-xl font-black italic mb-3 tracking-tight text-secondary">
                                {service.title}
                            </h3>
                            <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8 flex-grow">
                                {service.desc}
                            </p>

                            <Link
                                to={service.link}
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-black transition-all group/link"
                            >
                                <span className="border-b-2 border-primary/10 group-hover/link:border-black transition-colors">Learn More</span>
                                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Stats or CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
                >
                    <div className="inline-flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Global Infrastructure Online
                        </div>
                        <div className="hidden sm:block w-px h-3 bg-gray-100" />
                        <div className="hidden sm:block">Uptime: 99.9%</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Services;
