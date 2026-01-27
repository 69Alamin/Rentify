import React, { useState, useEffect } from 'react';
import { Building, Power, Trash2, MapPin, Loader, Plus, X, Users, DollarSign, Calendar, BedDouble, ChevronRight, Star, Phone, Mail, Eye, TrendingUp, Clock } from 'lucide-react';

const HotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [hotelDetails, setHotelDetails] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/hotels.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setHotels(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHotelDetails = async (hotelId) => {
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/hotel_details.php?id=${hotelId}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setHotelDetails(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleHotelClick = (hotel) => {
        setSelectedHotel(hotel);
        fetchHotelDetails(hotel.id);
    };

    const closeDetails = () => {
        setSelectedHotel(null);
        setHotelDetails(null);
    };

    const toggleActive = async (id, currentStatus, e) => {
        e.stopPropagation();
        // Optimistic update
        setHotels(hotels.map(h => h.id === id ? { ...h, is_active: !currentStatus } : h));

        try {
            await fetch('/api/admin/hotels.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_active', id, is_active: currentStatus ? 0 : 1 }),
                credentials: 'include'
            });
        } catch (err) {
            console.error(err);
            fetchHotels(); // Revert on error
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-600';
            case 'occupied': return 'bg-red-100 text-red-600';
            case 'maintenance': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getBookingStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-100 text-blue-600';
            case 'active': return 'bg-green-100 text-green-600';
            case 'completed': return 'bg-gray-100 text-gray-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Hotel Management</h2>
                    <p className="text-gray-400 text-xs">Manage hotels and emergency stops</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors">
                    <Plus size={16} /> Add Hotel
                </button>
            </div>

            {loading ? (
                <div className="py-12 flex justify-center"><Loader className="animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map(h => (
                        <div
                            key={h.id}
                            onClick={() => handleHotelClick(h)}
                            className={`bg-white p-6 rounded-[2rem] border-2 transition-all group cursor-pointer ${!h.is_active ? 'border-red-100 opacity-75 grayscale-[0.5]' : 'border-transparent hover:border-primary/20 shadow-lg shadow-gray-100 hover:shadow-xl hover:scale-[1.02]'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                                    🏨
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => toggleActive(h.id, h.is_active, e)}
                                        className={`p-2 rounded-xl transition-colors ${h.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}
                                        title={h.is_active ? "Emergency Stop (Deactivate)" : "Activate Hotel"}
                                    >
                                        <Power size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-secondary text-lg mb-1 truncate">{h.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                <MapPin size={12} /> {h.address}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                                <Users size={12} /> {h.owner_name || 'No owner'}
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-gray-50">
                                <span className={h.is_verified ? "text-green-500 bg-green-50 px-2 py-1 rounded" : "text-orange-500 bg-orange-50 px-2 py-1 rounded"}>
                                    {h.is_verified ? "VERIFIED" : "PENDING"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={h.is_active ? "text-green-500" : "text-red-500"}>
                                        {h.is_active ? "ACTIVE" : "STOPPED"}
                                    </span>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hotel Details Modal */}
            {selectedHotel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeDetails}>
                    <div
                        className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-orange-400 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">{selectedHotel.name}</h2>
                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                        <MapPin size={14} /> {selectedHotel.address}
                                    </div>
                                </div>
                                <button
                                    onClick={closeDetails}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {detailsLoading ? (
                                <div className="py-12 flex justify-center">
                                    <Loader className="animate-spin text-primary" size={32} />
                                </div>
                            ) : hotelDetails ? (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                                <Calendar size={18} />
                                                <span className="text-xs font-medium">Total Bookings</span>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-700">{hotelDetails.stats.total_bookings}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                                <TrendingUp size={18} />
                                                <span className="text-xs font-medium">Active</span>
                                            </div>
                                            <p className="text-2xl font-bold text-green-700">{hotelDetails.stats.active_bookings}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                                                <DollarSign size={18} />
                                                <span className="text-xs font-medium">Revenue</span>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-700">৳{hotelDetails.stats.total_revenue.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 text-orange-600 mb-2">
                                                <BedDouble size={18} />
                                                <span className="text-xs font-medium">Total Rooms</span>
                                            </div>
                                            <p className="text-2xl font-bold text-orange-700">{hotelDetails.stats.total_rooms}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 text-teal-600 mb-2">
                                                <Eye size={18} />
                                                <span className="text-xs font-medium">Available</span>
                                            </div>
                                            <p className="text-2xl font-bold text-teal-700">{hotelDetails.stats.available_rooms}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                                <Clock size={18} />
                                                <span className="text-xs font-medium">Occupied</span>
                                            </div>
                                            <p className="text-2xl font-bold text-red-700">{hotelDetails.stats.booked_rooms}</p>
                                        </div>
                                    </div>

                                    {/* Owner Info - Professional Design */}
                                    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                        {/* Section Header */}
                                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                    <Users size={16} />
                                                </div>
                                                Property Owner
                                            </h3>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Owner Avatar & Name */}
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/30">
                                                            {hotelDetails.hotel.owner_name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        {/* Online Status Indicator */}
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-xl font-bold text-secondary">{hotelDetails.hotel.owner_name || 'Unknown Owner'}</h4>
                                                            {hotelDetails.hotel.is_verified && (
                                                                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                                    <Star size={10} fill="white" /> VERIFIED
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-400 text-sm">Property Vendor</p>
                                                        <p className="text-xs text-gray-300 mt-1">Member since {new Date(hotelDetails.hotel.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                </div>

                                                {/* Divider */}
                                                <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

                                                {/* Contact Details */}
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Email Card */}
                                                    <div className="group bg-white rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                                                <Mail size={18} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Email Address</p>
                                                                <p className="font-semibold text-secondary truncate">{hotelDetails.hotel.owner_email || 'Not provided'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Phone Card */}
                                                    <div className="group bg-white rounded-xl p-4 border border-slate-100 hover:border-green-200 hover:shadow-md transition-all cursor-pointer">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-green-500/30 group-hover:scale-110 transition-transform">
                                                                <Phone size={18} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Phone Number</p>
                                                                <p className="font-semibold text-secondary">{hotelDetails.hotel.owner_phone || 'Not provided'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
                                                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                                    <Mail size={16} /> Send Email
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all hover:-translate-y-0.5">
                                                    <Phone size={16} /> Call Owner
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
                                                    <Eye size={16} /> View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Types */}
                                    <div>
                                        <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                            <BedDouble size={18} /> Room Types ({hotelDetails.room_types.length})
                                        </h3>
                                        {hotelDetails.room_types.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {hotelDetails.room_types.map(rt => (
                                                    <div key={rt.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="font-bold text-secondary">{rt.name}</h4>
                                                            <span className="text-primary font-bold text-sm">৳{rt.base_price_per_hour}/hr</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Users size={12} /> Capacity: {rt.capacity}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <BedDouble size={12} /> Rooms: {rt.room_count}
                                                            </span>
                                                        </div>
                                                        <div className="mt-3 flex gap-2">
                                                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                                                                {rt.available_count} Available
                                                            </span>
                                                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                                                {rt.room_count - rt.available_count} Occupied
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm">No room types configured</p>
                                        )}
                                    </div>

                                    {/* Individual Rooms */}
                                    <div>
                                        <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                            <Building size={18} /> All Rooms ({hotelDetails.rooms.length})
                                        </h3>
                                        {hotelDetails.rooms.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {hotelDetails.rooms.map(room => (
                                                    <div key={room.id} className={`p-3 rounded-xl border text-center ${getStatusColor(room.status)}`}>
                                                        <p className="font-bold text-lg">{room.room_number}</p>
                                                        <p className="text-xs opacity-75">{room.room_type_name}</p>
                                                        <p className="text-xs font-medium mt-1 capitalize">{room.status}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm">No rooms configured</p>
                                        )}
                                    </div>

                                    {/* Recent Bookings */}
                                    <div>
                                        <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                            <Calendar size={18} /> Recent Bookings ({hotelDetails.bookings.length})
                                        </h3>
                                        {hotelDetails.bookings.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            <th className="text-left py-3 px-2 text-gray-400 font-medium">Guest</th>
                                                            <th className="text-left py-3 px-2 text-gray-400 font-medium">Room</th>
                                                            <th className="text-left py-3 px-2 text-gray-400 font-medium">Check In</th>
                                                            <th className="text-left py-3 px-2 text-gray-400 font-medium">Check Out</th>
                                                            <th className="text-left py-3 px-2 text-gray-400 font-medium">Amount</th>
                                                            <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {hotelDetails.bookings.map(booking => (
                                                            <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                                <td className="py-3 px-2">
                                                                    <p className="font-medium text-secondary">{booking.user_name}</p>
                                                                    <p className="text-xs text-gray-400">{booking.user_email}</p>
                                                                </td>
                                                                <td className="py-3 px-2">
                                                                    <p className="font-medium">{booking.room_number}</p>
                                                                    <p className="text-xs text-gray-400">{booking.room_type_name}</p>
                                                                </td>
                                                                <td className="py-3 px-2 text-gray-600">
                                                                    {new Date(booking.check_in_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    <br />
                                                                    <span className="text-xs text-gray-400">
                                                                        {new Date(booking.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2 text-gray-600">
                                                                    {new Date(booking.check_out_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    <br />
                                                                    <span className="text-xs text-gray-400">
                                                                        {new Date(booking.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2 font-bold text-primary">৳{parseFloat(booking.total_price).toLocaleString()}</td>
                                                                <td className="py-3 px-2">
                                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getBookingStatusColor(booking.booking_status)}`}>
                                                                        {booking.booking_status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm">No bookings yet</p>
                                        )}
                                    </div>

                                    {/* Property Details */}
                                    <div className="bg-gray-50 rounded-2xl p-5">
                                        <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                            <Star size={18} /> Property Details
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400 text-xs">Created</p>
                                                <p className="font-medium">{new Date(hotelDetails.hotel.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Status</p>
                                                <p className={`font-medium ${hotelDetails.hotel.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                                    {hotelDetails.hotel.is_active ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Verification</p>
                                                <p className={`font-medium ${hotelDetails.hotel.is_verified ? 'text-green-500' : 'text-orange-500'}`}>
                                                    {hotelDetails.hotel.is_verified ? 'Verified' : 'Pending'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Description</p>
                                                <p className="font-medium truncate">{hotelDetails.hotel.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-8">Failed to load hotel details</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelManagement;
