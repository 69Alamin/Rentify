import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Star, MapPin, Loader, AlertCircle, Navigation, Search, Building2, ChevronRight, X, Filter, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

// Fix Leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom SVG Marker Generator - High-Fidelity Google Maps Style
const createCustomIcon = (isActive = false) => {
    if (isActive) {
        // Classic Google Red Pin
        const pinSvg = `
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                <path d="M20 38C20 38 35 25.5 35 15C35 6.71573 28.2843 0 20 0C11.7157 0 5 6.71573 5 15C5 25.5 20 38 20 38Z" fill="#EA4335"/>
                <circle cx="20" cy="15" r="7" fill="black" fill-opacity="0.2"/>
                <circle cx="20" cy="15" r="5" fill="white"/>
            </svg>
        `;
        return L.divIcon({
            html: pinSvg,
            className: 'google-red-pin',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    }

    // High-Fidelity Category Icon (Blue Circle + White Home)
    const iconSvg = `
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
            <circle cx="15" cy="15" r="13" fill="#1a73e8" stroke="white" stroke-width="1.5"/>
            <path d="M15 9L9 14V21H13V17H17V21H21V14L15 9Z" fill="white"/>
        </svg>
    `;
    return L.divIcon({
        html: iconSvg,
        className: 'google-category-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

const userIcon = L.divIcon({
    html: `
        <div class="user-location-marker">
            <div class="pulse"></div>
            <div class="dot"></div>
        </div>
    `,
    className: 'user-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Helper component to recenter map
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.5 }); // Standard city-navigation zoom level
        }
    }, [center, map]);
    return null;
};

// Routing component for navigation
const RoutingMachine = ({ userLocation, destination, onRouteUpdate }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !userLocation || !destination) return;

        // Remove existing routing control
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        // Create new routing control
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination.coords[0], destination.coords[1])
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    { color: '#ffffff', weight: 10, opacity: 0.8 }, // White border
                    { color: '#4285F4', weight: 6, opacity: 1 }    // Google Blue path
                ]
            },
            createMarker: () => null,
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            })
        }).addTo(map);

        routingControlRef.current = routingControl;

        // Fit map and extract info
        routingControl.on('routesfound', (e) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            // We no longer call fitBounds(bounds) here to avoid zooming out too far.
            // map.fitBounds(L.latLngBounds(routes[0].coordinates), { padding: [100, 100] });

            if (onRouteUpdate) {
                onRouteUpdate({
                    distance: (summary.totalDistance / 1000).toFixed(1), // km
                    duration: Math.round(summary.totalTime / 60)         // minutes
                });
            }
        });

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, userLocation, destination]);

    return null;
};

const MapExplorer = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [hotels, setHotels] = useState([]);
    const [activeHotel, setActiveHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([23.7771, 90.3994]); // Default Dhaka
    const [destination, setDestination] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {
        // Check for destination & start in URL params
        const params = new URLSearchParams(window.location.search);
        const lat = params.get('lat');
        const lng = params.get('lng');
        const label = params.get('label');
        const sLat = params.get('startLat');
        const sLng = params.get('startLng');
        const rideId = params.get('rideId');

        if (lat && lng) {
            const destCoords = [parseFloat(lat), parseFloat(lng)];
            setDestination({ coords: destCoords, label: label || 'Destination' });
            if (!sLat) setMapCenter(destCoords);
        }

        if (sLat && sLng) {
            const startCoords = [parseFloat(sLat), parseFloat(sLng)];
            setUserLocation(startCoords);
            setMapCenter(startCoords);
        } else if (navigator.geolocation && !userLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    if (!lat) setMapCenter([latitude, longitude]);
                },
                () => console.log('Could not get location'),
                { enableHighAccuracy: true }
            );
        }

        // Live Track Feature for specific Ride
        let interval;
        if (rideId) {
            const fetchLatest = async () => {
                try {
                    const res = await fetch('/api/rides/request.php', { credentials: 'include' });
                    const data = await res.json();
                    if (data.success) {
                        const myRide = data.data.find(r => r.id == rideId);
                        if (myRide && myRide.driver_lat && myRide.driver_lng) {
                            const isPicked = myRide.status === 'picked';
                            const rLat = parseFloat(myRide.driver_lat);
                            const rLng = parseFloat(myRide.driver_lng);
                            const dLat = isPicked ? parseFloat(myRide.destination_lat) : rLat;
                            const dLng = isPicked ? parseFloat(myRide.destination_lng) : rLng;

                            // If picked, route is Rider -> Hotel. Otherwise, Rider is the marker.
                            if (isPicked) {
                                setUserLocation([rLat, rLng]);
                                setDestination({ coords: [dLat, dLng], label: 'Hotel Destination' });
                            } else {
                                setDestination({ coords: [rLat, rLng], label: 'Rider Location' });
                            }
                        }
                    }
                } catch (e) { }
            };
            fetchLatest();
            interval = setInterval(fetchLatest, 5000);
        }

        // Keep local state in sync if URL changes (for live moves)
        const checkInterval = setInterval(() => {
            const p = new URLSearchParams(window.location.search);
            const nl = p.get('lat');
            const ng = p.get('lng');
            const sl = p.get('startLat');
            const sg = p.get('startLng');

            if (nl && ng) {
                setDestination(d => ({ ...d, coords: [parseFloat(nl), parseFloat(ng)] }));
            }
            if (sl && sg) {
                setUserLocation([parseFloat(sl), parseFloat(sg)]);
            }
        }, 3000);

        return () => { if (interval) clearInterval(interval); clearInterval(checkInterval); setRouteInfo(null); };
    }, []);

    useEffect(() => {
        // 1. Fetch Hotels
        const fetchHotels = async () => {
            try {
                const response = await fetch('/api/hotels.php');
                const data = await response.json();
                if (data.success) {
                    const validProps = data.data.filter(p => p.latitude && p.longitude).map(p => ({
                        ...p,
                        latitude: parseFloat(p.latitude),
                        longitude: parseFloat(p.longitude)
                    }));
                    setHotels(validProps);
                    console.log("Valid hotels loaded:", validProps);
                } else {
                    setError('Failed to load map data');
                }
            } catch (err) {
                setError('Network error loading map');
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();

        // 2. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                },
                (err) => {
                    console.error("Geolocation denied or error:", err);
                    // Fallback to default center or stay
                }
            );
        }
    }, []);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        return `/${url}`;
    };

    const handleCenterOnUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                },
                () => showError('Could not get your location')
            );
        } else {
            showError('Geolocation is not supported by your browser');
        }
    };

    const handleHotelSelect = (hotel) => {
        setActiveHotel(hotel);
        setMapCenter([hotel.latitude, hotel.longitude]); // This triggers RecenterMap set at zoom 15
        setDestination({
            coords: [hotel.latitude, hotel.longitude],
            label: hotel.name
        });
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center pt-20">
            <Loader className="animate-spin text-primary" size={30} />
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center pt-20 text-red-500 gap-2">
            <AlertCircle size={20} /> {error}
        </div>
    );

    return (
        <div className="w-full h-screen relative bg-gray-100 overflow-hidden pt-20">
            {/* Map Container - Full Screen Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Google-like Clean Voyager style
                    />

                    <RecenterMap center={mapCenter} />

                    {/* Routing */}
                    {destination && userLocation && (
                        <RoutingMachine
                            userLocation={userLocation}
                            destination={destination}
                            onRouteUpdate={setRouteInfo}
                        />
                    )}

                    {/* User Location Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup className="google-popup">You are Here</Popup>
                        </Marker>
                    )}

                    {/* Property Markers */}
                    {hotels.map((location) => (
                        <Marker
                            key={location.id}
                            position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                            icon={createCustomIcon(activeHotel?.id === location.id)}
                            eventHandlers={{
                                click: () => handleHotelSelect(location),
                            }}
                        >
                            <Popup className="google-popup">
                                <div className="w-64 p-0 overflow-hidden rounded-2xl">
                                    <div className="h-32 relative">
                                        <img src={getImageUrl(location.image_url)} alt={location.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                            ৳{location.price_per_hour}/hr
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-black text-secondary text-base leading-tight mb-1">{location.name}</h3>
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-bold text-gray-700">{location.rating || '4.8'}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">({location.review_count || '120+'})</span>
                                        </div>
                                        <Link
                                            to={`/hotels/${location.id}`}
                                            className="flex items-center justify-center gap-2 w-full text-center py-4 bg-[#4f46e5] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-300/50 hover:bg-[#4338ca] hover:scale-[1.05] hover:shadow-indigo-400/60 active:scale-95"
                                        >
                                            Book This Stay <ChevronRight size={14} className="stroke-[3px]" />
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Google-Style Floating Search Pill */}
            <div className="absolute top-24 left-6 z-[1005] w-full max-w-sm pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-full shadow-google-pill border border-gray-100 p-2 flex items-center gap-2">
                    <div className="w-10 h-10 flex items-center justify-center text-[#1a73e8]">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search hotels or areas..."
                        className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 placeholder-gray-400"
                    />
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1a73e8] cursor-pointer transition-colors">
                        <MapPin size={18} />
                    </div>
                </div>
                <div className="mt-3 flex gap-2 pointer-events-auto px-1 overflow-x-auto no-scrollbar">
                    {['Top Rated', 'Pool', 'Free WiFi', 'AC'].map(tag => (
                        <button key={tag} className="bg-white px-4 py-1.5 rounded-full shadow-sm text-[11px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 whitespace-nowrap">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Floating Hotel Sheet (Left Edge) */}
            <div className={`absolute top-52 left-6 bottom-10 w-full md:w-[380px] pointer-events-none z-[1002] transition-all duration-500 ${destination ? '-translate-x-[450px] opacity-0' : 'translate-x-0 opacity-100'}`}>
                <div className="h-full flex flex-col pointer-events-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-google-sheet border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-secondary tracking-tight">Stay Explorer</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[#1a73e8] font-bold mt-0.5">{hotels.length} verified stays</p>
                        </div>
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                            <Filter size={14} />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-2 bg-gray-50/30">
                        {hotels.map((prop, idx) => (
                            <motion.div
                                key={prop.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => handleHotelSelect(prop)}
                                className={`group rounded-2xl border transition-all duration-300 cursor-pointer p-3 flex gap-4 ${activeHotel?.id === prop.id
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <img src={getImageUrl(prop.image_url)} alt={prop.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-between flex-grow">
                                    <div>
                                        <h3 className="font-bold text-sm text-secondary line-clamp-1 group-hover:text-[#1a73e8]">{prop.name}</h3>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-bold text-gray-500">{prop.rating || '4.8'}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 truncate">{prop.address}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-black text-[#3c4043]">৳{prop.price_per_hour}<span className="opacity-40 font-bold ml-1">/hr</span></span>
                                        <Link
                                            to={`/hotels/${prop.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-[#4f46e5] text-white rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_4px_14px_0_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:bg-[#4338ca] active:scale-95"
                                        >
                                            Book This Stay <ChevronRight size={14} className="stroke-[3px]" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Aura Maps Attribution */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-gray-400 border border-gray-100 shadow-sm">
                    <span className="text-[#4285F4]">A</span>
                    <span className="text-[#EA4335]">u</span>
                    <span className="text-[#FBBC05]">r</span>
                    <span className="text-[#34A853]">a</span>
                    <span className="ml-1 opacity-60">Maps</span>
                </div>
            </div>
            {/* Navigation Close Overlay (Google Maps Style) - Bottom Floating */}
            {destination && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-lg px-6">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-[#1a73e8] text-white p-5 rounded-[2rem] shadow-2xl flex justify-between items-center"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Navigation size={24} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-black leading-none">Directions to Stay</h3>
                                <p className="text-[10px] font-bold text-white mt-1 uppercase tracking-widest truncate max-w-[200px]">
                                    {routeInfo ? `${routeInfo.duration} min (${routeInfo.distance} km) • ${destination.label}` : destination.label}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const url = new URL(window.location);
                                url.searchParams.delete('lat');
                                url.searchParams.delete('lng');
                                url.searchParams.delete('label');
                                window.history.pushState({}, '', url);
                                setDestination(null);
                                setRouteInfo(null);
                            }}
                            className="bg-white text-[#1a73e8] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg"
                        >
                            Exit
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Floating Map Controls (Right Side) */}
            <div className="absolute bottom-10 right-10 z-[1000] flex flex-col gap-3">
                <button
                    onClick={handleCenterOnUser}
                    className="bg-white p-4 rounded-full shadow-xl hover:bg-gray-50 transition-all text-[#1a73e8] active:scale-95 group"
                    title="Center on me"
                >
                    <Navigation size={22} className="group-hover:rotate-45 transition-transform" />
                </button>
                <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-100 text-[10px] font-black text-secondary shadow-lg uppercase tracking-widest">
                    {hotels.length} Hotspots
                </div>
            </div>
        </div>
    );
};

export default MapExplorer;
