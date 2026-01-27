import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark text-gray-300 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-2xl aura-gradient-primary shadow-aura-lg shadow-indigo-500/20"></div>
                                <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-2xl italic">Q</div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xl">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-white italic tracking-tighter">Quickrent</span>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Experience the freedom of hourly stays. Premium comfort, flexible pricing, and verified locations for your short-term needs.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {['Home', 'About Us', 'Our Hotels', 'How It Works', 'Reviews'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-primary mt-1" size={20} />
                                <span>123 Innovation Dr, Tech City, TC 90210</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-primary" size={20} />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-primary" size={20} />
                                <span>support@quickrent.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white text-lg font-bold mb-6">Newsletter</h4>
                        <p className="text-gray-400 mb-4">Subscribe to get special offers and updates.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                            <button className="absolute right-1 top-1 bg-primary text-white p-2 rounded-md hover:bg-primary-hover transition-colors">
                                <Mail size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Quickrent. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
