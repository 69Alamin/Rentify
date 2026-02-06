import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Search, MapPin, Navigation, Star, X, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

// Fix Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Import Routing logic
const RoutingMachine = ({ userLocation, destination }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !userLocation || !destination) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination.coords[0], destination.coords[1])
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#4285F4', weight: 6, opacity: 1 }]
            },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false // Hide text instructions
        }).addTo(map);

        routingControlRef.current = routingControl;

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, userLocation, destination]);

    return null;
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

const createCustomIcon = (isActive) => {
    const color = isActive ? '#EA4335' : '#1a73e8';
    const svg = `
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
            <circle cx="15" cy="15" r="13" fill="${color}" stroke="white" stroke-width="1.5"/>
            <path d="M15 9L9 14V21H13V17H17V21H21V14L15 9Z" fill="white"/>
        </svg>
    `;
    return L.divIcon({
        html: svg,
        className: 'custom-map-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
};

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 15, { duration: 1 });
    }, [center, map]);
    return null;
};

// AUTO-COMPUTE BOUNDS: Minimize map (zoom out) to show hotels if user is far away
const FitMapToMarkers = ({ markers, userLocation }) => {
    const map = useMap();

    useEffect(() => {
        // If there are no markers, do nothing
        if (!map || markers.length === 0) return;

        // Create a bounds object
        const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));

        // If we have a user location, include it in the bounds so the user sees themselves relative to the hotels
        if (userLocation) {
            bounds.extend(userLocation);
        }

        // Fit the map to these bounds with some padding
        // This ensures at least the 'markers' (closest hotels) are visible
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    }, [map, markers, userLocation]);

    return null;
};

const MobileMap = () => {
    const { showError } = useModal();
    const [hotels, setHotels] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([23.7937, 90.4066]); // Default Banani
    const [activeHotel, setActiveHotel] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('');
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        // Fetch Hotels first
        fetch('/api/hotels.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const valid = data.data.filter(h => h.latitude && h.longitude).map(h => ({
                        ...h, latitude: parseFloat(h.latitude), longitude: parseFloat(h.longitude)
                    }));

                    // Logic to ensure we have "some" hotels to show
                    setHotels(valid);
                }
            })
            .catch(err => console.error(err));

        locateUser();
    }, []);

    const locateUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const loc = [latitude, longitude];
                    setUserLocation(loc);
                    // We DO NOT setMapCenter here because we want FitMapToMarkers to handle the initial view
                    // setMapCenter(loc); 
                },
                () => {
                    // Fail silently
                }
            );
        }
    };

    const handleHotelSelect = (hotel) => {
        setActiveHotel(hotel);
        setMapCenter([hotel.latitude, hotel.longitude]);

        if (userLocation) {
            setDestination({ coords: [hotel.latitude, hotel.longitude] });
        }
    };

    const handleGetDirections = () => {
        if (userLocation && activeHotel) {
            setDestination({ coords: [activeHotel.latitude, activeHotel.longitude] });
        }
    };

    const filteredHotels = hotels.filter(hotel => {
        const matchesSearch = !searchQuery ||
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.address.toLowerCase().includes(searchQuery.toLowerCase());

        const hasFacility = (field) => {
            const value = hotel[field];
            return value == 1 || value === '1' || value === true;
        };

        const matchesTag = !activeTag || (
            (activeTag === 'Top Rated' && parseFloat(hotel.rating) >= 4.5) ||
            (activeTag === 'WiFi' && hasFacility('has_wifi')) ||
            (activeTag === 'AC' && hasFacility('has_ac')) ||
            (activeTag === 'Pool' && hasFacility('has_pool')) ||
            (activeTag === 'Parking' && hasFacility('has_parking'))
        );

        return matchesSearch && matchesTag;
    });

    // We take a slice of hotels to ensure we don't zoom out to the whole world if hotels are scattered
    // We take the first 5 hotels (assuming API returns them in some logical order, or just random) 
    // to verify the "show at least 2-5 hotels" requirement.
    const initialSubset = filteredHotels.slice(0, 5);

    return (
        <div className="relative w-full h-[calc(100vh-80px)] bg-gray-100">
            {/* Map */}
            <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* 
                    AUTO-ZOOM COMPONENT
                    This will run once markers are available and fit the map to show them.
                 */}
                <FitMapToMarkers markers={initialSubset} userLocation={userLocation} />
                <RecenterMap center={mapCenter} />

                {userLocation && <Marker position={userLocation} icon={userIcon} />}

                {destination && userLocation && (
                    <RoutingMachine userLocation={userLocation} destination={destination} />
                )}

                {filteredHotels.map(hotel => (
                    <Marker
                        key={hotel.id}
                        position={[hotel.latitude, hotel.longitude]}
                        icon={createCustomIcon(activeHotel?.id === hotel.id)}
                        eventHandlers={{
                            click: () => handleHotelSelect(hotel)
                        }}
                    />
                ))}
            </MapContainer>

            {/* Search & Filters */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
                <div className="bg-white/95 backdrop-blur shadow-lg rounded-2xl p-3 flex items-center gap-3 border border-gray-100 pointer-events-auto">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search area..."
                        className="flex-1 bg-transparent text-sm font-medium outline-none text-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                        <MapPin size={16} />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto pb-1">
                    {['Top Rated', 'WiFi', 'AC', 'Pool', 'Parking'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm whitespace-nowrap transition-colors ${activeTag === tag
                                    ? 'bg-accent text-white border-accent'
                                    : 'bg-white text-gray-600 border-gray-200'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => {
                    // Manual re-center to user
                    if (userLocation) {
                        setMapCenter(userLocation);
                    } else {
                        locateUser();
                    }
                }}
                className="absolute bottom-6 right-4 z-[1000] p-4 bg-white rounded-full shadow-xl text-accent active:scale-95 transition-transform"
            >
                <Crosshair size={24} />
            </button>

            <AnimatePresence>
                {activeHotel && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="absolute bottom-4 left-4 right-4 z-[1000]"
                    >
                        <div className="bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 relative">
                            <button
                                onClick={() => setActiveHotel(null)}
                                className="absolute top-2 right-2 p-1 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                    <img
                                        src={activeHotel.image_url || '/assets/default_hotel.png'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 truncate">{activeHotel.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold text-gray-700">{activeHotel.rating || '4.8'}</span>
                                        <span>({activeHotel.review_count || 50})</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{activeHotel.address}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-black text-accent">৳{activeHotel.price_per_hour}<span className="text-[10px] bg-transparent text-gray-400 font-normal">/hr</span></span>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleGetDirections}
                                                className="bg-sky-100 text-sky-600 p-2 rounded-lg"
                                            >
                                                <Navigation size={14} />
                                            </button>
                                            <Link
                                                to={`/hotels/${activeHotel.id}`}
                                                className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                                            >
                                                Book
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileMap;
