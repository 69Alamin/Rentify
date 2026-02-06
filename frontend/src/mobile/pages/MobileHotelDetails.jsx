import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Wifi, Droplets, Snowflake, Clock, CheckCircle,
    ArrowLeft, Car, Wind, Utensils, Zap, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MobileBookingModal from '../../mobile/components/MobileBookingModal';

const MobileHotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingModal, setBookingModal] = useState({ isOpen: false, room: null, isEmergency: false });
    const [reviewData, setReviewData] = useState({ reviews: [], average_rating: 0, review_count: 0 });
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [propRes, reviewsRes, menuRes] = await Promise.all([
                    fetch(`/api/hotels/details.php?id=${id}`),
                    fetch(`/api/reviews/get_reviews.php?hotel_id=${id}`),
                    fetch(`/api/food/menu.php?hotel_id=${id}`)
                ]);
                const propData = await propRes.json();
                const reviewsData = await reviewsRes.json();
                const menuData = await menuRes.json();

                if (propData.success) {
                    setHotel(propData.data.hotel);
                    setRooms(propData.data.rooms);
                }
                if (reviewsData.success) {
                    setReviewData(reviewsData.data);
                }
                if (menuData.success) {
                    setMenu(menuData.data);
                }
            } catch (err) {
                console.error("Failed to load details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleBookingSuccess = () => {
        // Close modal
        setBookingModal({ isOpen: false, room: null, isEmergency: false });
        // Redirect to trips/history page
        navigate('/history');
    };

    if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-accent">Loading...</div>;
    if (!hotel) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Hotel not found</div>;

    const amenities = [
        { key: 'has_wifi', icon: Wifi, label: 'WiFi' },
        { key: 'has_ac', icon: Snowflake, label: 'AC' },
        { key: 'has_parking', icon: Car, label: 'Parking' },
        { key: 'has_restaurant', icon: Utensils, label: 'Food' },
    ].filter(item => hotel[item.key] == 1);

    return (
        <div className="bg-navy min-h-screen pb-24 relative">
            {/* Image Header with Back Button */}
            <div className="relative h-72 w-full">
                <img
                    src={hotel.image_url || '/assets/default_hotel.png'}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = '/assets/default_hotel.png'}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-navy" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10 z-10"
                >
                    <ArrowLeft size={20} />
                </button>

                <button
                    onClick={() => navigate('/history')}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10 z-10 text-xs font-bold"
                >
                    My Trips
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-accent text-navy px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                            {hotel.hotel_type}
                        </span>
                        {hotel.is_verified == 1 && (
                            <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-500/20">
                                <ShieldCheck size={10} /> Verified
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black text-white leading-tight mb-2">{hotel.name}</h1>
                    <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
                        <MapPin size={12} className="text-accent" />
                        {hotel.address}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-4 relative z-10 space-y-6">
                {/* Rating Card */}
                <div className="flex items-center justify-between bg-navy-light border border-white/5 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-xl">
                            <Star className="text-yellow-400 fill-yellow-400" size={20} />
                        </div>
                        <div>
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-black text-white">{reviewData.average_rating || '4.8'}</span>
                                <span className="text-[10px] text-gray-400 mb-1">/ 5.0</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Based on {reviewData.review_count} Reviews</span>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-600" size={16} />
                </div>

                {/* About */}
                <div>
                    <h2 className="text-white font-bold text-lg mb-3">About</h2>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                        {hotel.description || "Experience comfort and luxury."}
                    </p>
                </div>

                {/* Amenities */}
                <div>
                    <h2 className="text-white font-bold text-lg mb-3">Amenities</h2>
                    <div className="grid grid-cols-4 gap-3">
                        {amenities.map((item, idx) => (
                            <div key={idx} className="bg-navy-light border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center aspect-square">
                                <item.icon className="text-accent" size={20} />
                                <span className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rooms */}
                <div>
                    <h2 className="text-white font-bold text-lg mb-4">Choose Room</h2>
                    <div className="space-y-4">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-navy-light border border-white/5 rounded-2xl overflow-hidden group">
                                <div className="h-40 relative">
                                    <img
                                        src={room.image_url || '/assets/default_property.jpg'}
                                        onError={(e) => e.target.src = '/assets/default_property.jpg'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
                                        Max {room.capacity} Guests
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-white">{room.name}</h3>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-accent">৳{room.base_price_per_hour}</div>
                                            <div className="text-[9px] text-gray-400 uppercase font-bold">Per Hour</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-4">
                                        {room.has_wifi == 1 && <div className="flex items-center gap-1"><Wifi size={12} /> Wifi</div>}
                                        {room.has_ac == 1 && <div className="flex items-center gap-1"><Wind size={12} /> AC</div>}
                                    </div>
                                    <button
                                        onClick={() => setBookingModal({ isOpen: true, room: room, isEmergency: false })}
                                        className="w-full py-3 bg-white text-navy font-black uppercase text-xs tracking-widest rounded-xl hover:bg-accent transition-colors"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Food Menu Section */}
                {menu.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Utensils size={18} className="text-accent" /> Room Service Menu
                        </h2>
                        <div className="space-y-3">
                            {menu.slice(0, 4).map(item => (
                                <div key={item.id} className="bg-navy-light border border-white/5 rounded-xl p-3 flex gap-3">
                                    <div className="w-16 h-16 bg-navy rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.image_url || '/assets/food/default_food.svg'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = '/assets/food/default_food.svg'}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</p>
                                        <p className="font-black text-accent mt-1">৳{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {menu.length > 4 && (
                            <p className="text-center text-gray-500 text-xs mt-3">+ {menu.length - 4} more items available after check-in</p>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {bookingModal.isOpen && (
                <MobileBookingModal
                    room={bookingModal.room}
                    hotel={hotel}
                    isOpen={bookingModal.isOpen}
                    isEmergency={bookingModal.isEmergency}
                    onClose={() => setBookingModal({ isOpen: false, room: null, isEmergency: false })}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}
        </div>
    );
};

export default MobileHotelDetails;
