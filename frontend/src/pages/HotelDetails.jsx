import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Droplets, Snowflake, Clock, CheckCircle, AlertCircle, Loader, ArrowLeft, AlertTriangle, Car, Wind, Building, ShoppingBag, Dumbbell, Waves, Home, Phone, Mail, ShieldCheck, Utensils, Users, Zap, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingModal, setBookingModal] = useState({ isOpen: false, room: null, isEmergency: false });
    const [reviewData, setReviewData] = useState({ reviews: [], average_rating: 0, review_count: 0 });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [propRes, menuRes, reviewsRes] = await Promise.all([
                    fetch(`/api/hotels/details.php?id=${id}`),
                    fetch(`/api/food/menu.php?hotel_id=${id}`),
                    fetch(`/api/reviews/get_reviews.php?hotel_id=${id}`)
                ]);
                const propData = await propRes.json();
                const menuData = await menuRes.json();
                const reviewsData = await reviewsRes.json();

                if (propData.success) {
                    setHotel(propData.data.hotel);
                    setRooms(propData.data.rooms);
                } else {
                    setError(propData.message || 'Hotel not found');
                }

                if (menuData.success) {
                    setMenu(menuData.data);
                }

                if (reviewsData.success) {
                    setReviewData(reviewsData.data);
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (!loading && rooms.length > 0 && searchParams.get('emergency') === 'true') {
            const firstAvailable = rooms.find(r => r.available_count > 0);
            if (firstAvailable) {
                setBookingModal({ isOpen: true, room: firstAvailable, isEmergency: true });
            }
        }
    }, [loading, rooms, searchParams]);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('blob:'))) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    const handleBook = (roomTypeId) => {
        const room = rooms.find(r => r.id === roomTypeId);
        if (room) {
            setBookingModal({ isOpen: true, room, isEmergency: false });
        } else {
            console.error('Room not found');
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
            <Loader className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return (
        <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-red-600 gap-4">
            <div className="flex items-center gap-2 text-xl font-bold">
                <AlertCircle size={24} /> {error}
            </div>
            <button onClick={() => navigate('/hotels')} className="text-secondary hover:underline">Back to Hotels</button>
        </div>
    );

    if (!hotel) return null;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            {/* Hero Section */}
            <div className="relative h-[450px] md:h-[550px] w-full overflow-hidden">
                <img
                    src={getImageUrl(hotel.image_url)}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error(`Failed to load hero image:`, hotel.image_url);
                        e.target.src = '/assets/default_hotel.png';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent flex items-end">
                    <div className="container mx-auto px-6 pb-20 text-white">
                        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-all font-bold backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/10 w-fit">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Discovery
                        </button>
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">{hotel.hotel_type}</span>
                                {hotel.is_verified == 1 && (
                                    <span className="bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                        <ShieldCheck size={12} fill="currentColor" /> Verified Partner
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none italic">{hotel.name}</h1>
                            <div className="flex flex-wrap gap-6 items-center">
                                <div className="flex items-center gap-2 text-sm font-bold opacity-90">
                                    <MapPin size={18} className="text-primary" /> {hotel.address}
                                </div>
                                <div className="w-1 h-1 bg-white/30 rounded-full hidden md:block"></div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 font-bold">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm">{reviewData.average_rating > 0 ? reviewData.average_rating : '4.8'}</span>
                                    <span className="text-xs text-white/50 ml-1">({reviewData.review_count || '120+'} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 relative z-10 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* About Section */}
                        <div className="bg-white rounded-[2rem] shadow-aura-md p-10 border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight uppercase italic">The Aura Experience</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-lg mb-10 font-medium">
                                {hotel.description || `Welcome to ${hotel.name}, where professional hospitality meets modern convenience. Designed for the agile traveler, our spaces provide the perfect blend of rest and productivity.`}
                            </p>

                            {/* Enhanced Amenities */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { key: 'has_wifi', icon: Wifi, label: 'Connectivity', sub: 'High-speed Fiber' },
                                    { key: 'has_parking', icon: Car, label: 'Security', sub: '24/7 Monitoring' },
                                    { key: 'has_ac', icon: Wind, label: 'Climate', sub: 'Individual Control' },
                                    { key: 'has_elevator', icon: Building, label: 'Accessibility', sub: 'Full Access' },
                                    { key: 'has_restaurant', icon: Utensils, label: 'Cuisine', sub: 'Chef Prepared' },
                                    { key: 'has_gym', icon: Dumbbell, label: 'Wellness', sub: 'Fully Equipped' },
                                    { key: 'has_pool', icon: Waves, label: 'Relaxation', sub: 'Heated Pool' },
                                    { key: 'has_laundry', icon: Clock, label: 'Service', sub: 'Express Clean' },
                                ].filter(item => hotel[item.key] == 1).map((item, idx) => (
                                    <div key={idx} className="group p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all duration-300">
                                        <div className="w-12 h-12 bg-white text-primary rounded-xl flex items-center justify-center mb-4 border border-gray-100 shadow-aura-sm group-hover:scale-110 transition-transform">
                                            <item.icon size={22} />
                                        </div>
                                        <h4 className="font-black text-secondary text-xs uppercase tracking-widest mb-1">{item.label}</h4>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{item.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Policies & Rules */}
                        <div className="bg-white rounded-[2rem] shadow-aura-sm p-10 border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-8 w-1.5 bg-red-400 rounded-full"></div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight uppercase italic">Stay Policies</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {hotel.house_rules && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">House Rules</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">{hotel.house_rules}</p>
                                    </div>
                                )}
                                {hotel.cancellation_policy && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Cancellation</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">{hotel.cancellation_policy}</p>
                                    </div>
                                )}
                            </div>
                            {hotel.check_in_time && (
                                <div className="mt-10 flex gap-10 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Clock size={16} /></div>
                                        <div>
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Check-In</div>
                                            <div className="text-sm font-black text-secondary mt-1 tracking-tight">{hotel.check_in_time}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={16} /></div>
                                        <div>
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Check-Out</div>
                                            <div className="text-sm font-black text-secondary mt-1 tracking-tight">{hotel.check_out_time}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Room Selection Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between" id="room-selection-header">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-secondary tracking-tight uppercase italic">Select Your Suite</h2>
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{rooms.length} Tier Options</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {rooms.map(room => (
                                    <div key={room.id} className="bg-white rounded-[2rem] shadow-aura-md overflow-hidden flex flex-col md:flex-row border border-gray-100 group hover:border-primary/20 transition-all duration-500">
                                        <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                                            <img
                                                src={getImageUrl(room.image_url)}
                                                alt={room.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-secondary shadow-lg">
                                                <Users size={12} className="inline mr-1 text-primary" /> Up to {room.capacity}
                                            </div>
                                        </div>
                                        <div className="p-10 flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-2xl font-black text-secondary tracking-tight">{room.name}</h3>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-black text-secondary italic leading-none">৳{room.base_price_per_hour}</div>
                                                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">per hour</div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 font-medium leading-relaxed mb-8 line-clamp-2">
                                                    {room.description || 'Experience the perfect balance of luxury and functionality in our premium smart suites.'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                                    <span className="flex items-center gap-1.5 text-green-500"><Wifi size={14} /> WiFi</span>
                                                    <span className="flex items-center gap-1.5 text-blue-500"><Wind size={14} /> AC</span>
                                                </div>
                                                <button
                                                    onClick={() => handleBook(room.id)}
                                                    disabled={room.available_count == 0}
                                                    className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${room.available_count > 0
                                                        ? 'bg-secondary text-white hover:bg-primary shadow-secondary/10'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
                                                >
                                                    {room.available_count > 0 ? 'Reserve Now' : 'Fully Booked'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="space-y-6">
                        <div className="sticky top-28 space-y-6">
                            {/* Booking Summary Card */}
                            <div className="bg-[#0f172a] text-white rounded-[2.5rem] shadow-aura-xl p-10 relative overflow-hidden group border border-white/5">
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all duration-1000"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-xs font-black uppercase tracking-[0.2em] mb-6">
                                        <Zap size={10} className="fill-current" /> Instant Stay
                                    </div>
                                    <div className="space-y-6 mb-10">
                                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                                            <span className="text-xs font-black uppercase tracking-widest text-white/40">From Rate</span>
                                            <span className="text-2xl font-black italic tracking-tighter">৳{rooms[0]?.base_price_per_hour || hotel.price_per_hour}<span className="text-sm opacity-40 ml-1">/hr</span></span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                                                <div className="w-6 h-6 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center shrink-0"><CheckCircle size={14} /></div>
                                                <span>Free Ride Assistance</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                                                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0"><CheckCircle size={14} /></div>
                                                <span>Aura Verified Property</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const roomSec = document.getElementById('room-selection-header');
                                            if (roomSec) roomSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.03] hover:rotate-1 active:scale-95 transition-all"
                                    >
                                        RESERVE MY STAY
                                    </button>
                                </div>
                            </div>

                            {/* Trust & Verification Sidebar Card */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-aura-sm space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Hospitality Standards</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 bg-gray-50 text-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-all shadow-aura-sm">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-secondary">Aura Secure</h4>
                                            <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed uppercase tracking-tighter">Verified safety protocols and verified owner identity.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 bg-gray-50 text-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-aura-sm">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-secondary">Aura Flex</h4>
                                            <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed uppercase tracking-tighter">Extend your stay by the hour via the dashboard instantly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Sidebar Card */}
                            {(hotel.contact_phone || hotel.contact_email) && (
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-aura-sm">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 font-black">Direct Contact</h3>
                                    <div className="space-y-5">
                                        {hotel.contact_phone && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Phone size={18} /></div>
                                                <div className="font-black text-sm text-secondary tracking-tight">{hotel.contact_phone}</div>
                                            </div>
                                        )}
                                        {hotel.contact_email && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Mail size={18} /></div>
                                                <div className="font-black text-xs text-secondary tracking-tight truncate w-40">{hotel.contact_email}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Help Desk */}
                            <div className="bg-gray-950 text-white rounded-[2.5rem] p-8 shadow-aura-xl relative overflow-hidden">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-6">
                                        <MessageSquare size={28} className="text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black italic tracking-tighter mb-2">Need Assistance?</h3>
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-6">Concierge desk open 24/7</p>
                                    <button className="w-full py-3.5 bg-white text-secondary rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">
                                        Open Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                <BookingModal
                    room={bookingModal.room}
                    hotel={hotel}
                    isOpen={bookingModal.isOpen}
                    isEmergency={bookingModal.isEmergency}
                    onClose={() => setBookingModal({ isOpen: false, room: null, isEmergency: false })}
                    onBookingSuccess={() => navigate('/dashboard?booking=success')}
                />

                {menu.length > 0 && (
                    <div className="mt-20 mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-2 bg-primary rounded-full"></div>
                            <h2 className="text-3xl font-black text-secondary tracking-tight">Gourmet In-Room Dining</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {menu.map(item => (
                                <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 group hover:-translate-y-2 transition-all duration-500">
                                    <div className="aspect-square bg-gray-50 rounded-[2rem] mb-4 overflow-hidden relative group-hover:bg-primary/5 transition-colors">
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                if (item.image_fallback && e.target.src !== getImageUrl(item.image_fallback)) {
                                                    e.target.src = getImageUrl(item.image_fallback);
                                                } else {
                                                    e.target.src = '/assets/food/default_food.svg';
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <h4 className="font-black text-secondary text-lg mb-1 leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                                    <p className="text-gray-400 text-xs font-bold mb-4 line-clamp-2 uppercase tracking-wide">{item.category}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                                        <span className="font-black text-2xl text-secondary">৳{item.price}</span>
                                        <div className="w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors">
                                            <CheckCircle size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 bg-secondary rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-xl shadow-secondary/20">
                            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 scale-150 text-white">
                                <CheckCircle size={150} />
                            </div>
                            <div className="relative z-10 text-center md:text-left">
                                <h3 className="text-2xl font-black text-white mb-1 italic tracking-tighter">Already Staying?</h3>
                                <p className="text-white/50 font-bold text-xs tracking-widest uppercase">Order gourmet dining via your central dashboard portal.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="relative z-10 bg-primary text-white px-8 py-4 rounded-xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap uppercase text-xs tracking-[0.2em]"
                            >
                                <Building size={16} /> GUEST PORTAL
                            </button>
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 bg-yellow-400 rounded-full"></div>
                            <h2 className="text-3xl font-black text-secondary tracking-tight">Guest Reviews</h2>
                        </div>
                        {reviewData.review_count > 0 && (
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                                <Star size={20} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xl font-black text-secondary">{reviewData.average_rating}</span>
                                <span className="text-gray-400 text-sm">based on {reviewData.review_count} reviews</span>
                            </div>
                        )}
                    </div>

                    {reviewData.reviews.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold uppercase tracking-widest">No reviews yet. Be the first to stay and review!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviewData.reviews.map(review => (
                                <div key={review.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-secondary">
                                                {review.user_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-secondary">{review.user_name}</div>
                                                <div className="text-xs text-gray-400 uppercase font-black tracking-widest">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;
