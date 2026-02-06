import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Navigation, X, MapPin, Clock, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// User location marker (blue pulsing dot)
const userIcon = L.divIcon({
    html: `
        <div style="position: relative;">
            <div style="position: absolute; width: 40px; height: 40px; background: rgba(66, 133, 244, 0.2); border-radius: 50%; animation: pulse 2s infinite; left: -10px; top: -10px;"></div>
            <div style="width: 20px; height: 20px; background: #4285F4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
    `,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Destination marker (red pin)
const destinationIcon = L.divIcon({
    html: `
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <path d="M20 48C20 48 37 30 37 17C37 17C37 7.61116 29.3888 0 20 0C10.6112 0 3 7.61116 3 17C3 30 20 48 20 48Z" fill="#EA4335"/>
            <circle cx="20" cy="17" r="8" fill="white"/>
        </svg>
    `,
    className: 'destination-icon',
    iconSize: [40, 50],
    iconAnchor: [20, 50]
});

// Map recenter component
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

// Routing component
const RoutingMachine = ({ origin, destination, onRouteCalculated }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    const isValidCoord = (c) => {
        if (!c || !Array.isArray(c) || c.length < 2) return false;
        const lat = parseFloat(c[0]);
        const lng = parseFloat(c[1]);
        return !isNaN(lat) && !isNaN(lng);
    };

    // Initial creation of the routing control
    useEffect(() => {
        if (!map || !isValidCoord(origin) || !isValidCoord(destination)) return;

        // Ensure map layout is correct
        setTimeout(() => map.invalidateSize(), 500);

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(parseFloat(origin[0]), parseFloat(origin[1])),
                L.latLng(parseFloat(destination[0]), parseFloat(destination[1]))
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            routeWhileDragging: false,
            showAlternatives: false,
            addWaypoints: false,
            fitSelectedRoutes: false,
            lineOptions: {
                styles: [
                    { color: '#ffffff', weight: 8, opacity: 0.8 },
                    { color: '#4285F4', weight: 6, opacity: 1 }
                ]
            },
            createMarker: () => null
        }).addTo(map);

        routingControl.on('routesfound', (e) => {
            const route = e.routes[0];
            if (onRouteCalculated && route) {
                onRouteCalculated({
                    distance: (route.summary.totalDistance / 1000).toFixed(1),
                    duration: Math.round(route.summary.totalTime / 60),
                    instructions: route.instructions || []
                });
            }
            // Fit bounds only once when route is first found or if not started
            const bounds = L.latLngBounds(route.coordinates);
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
        });

        // Hide instructions
        const container = routingControl.getContainer();
        if (container) container.style.display = 'none';

        routingControlRef.current = routingControl;

        return () => {
            if (routingControlRef.current && map) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (e) { }
                routingControlRef.current = null;
            }
        };
    }, [map]);

    // Smooth Waypoint Updates
    useEffect(() => {
        if (routingControlRef.current && isValidCoord(origin) && isValidCoord(destination)) {
            routingControlRef.current.setWaypoints([
                L.latLng(parseFloat(origin[0]), parseFloat(origin[1])),
                L.latLng(parseFloat(destination[0]), parseFloat(destination[1]))
            ]);
        }
    }, [origin?.[0], origin?.[1], destination?.[0], destination?.[1]]);

    return null;
};

// Main Embedded Navigation Component
const EmbeddedNavigation = ({
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    navigationType = 'pickup', // 'pickup' or 'dropoff'
    customerName,
    onClose,
    isMobile = false,
    remoteOrigin = null, // [lat, lng] for customer to track driver
    isCustomerView = false,
    hideUI = false
}) => {
    const [userLocation, setUserLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isStarted, setIsStarted] = useState(false);

    // If customer view, use remote driver origin as the "moving dot"
    useEffect(() => {
        if (remoteOrigin) {
            setUserLocation(remoteOrigin);
            setLoading(false);
        }
    }, [remoteOrigin]);

    const destination = navigationType === 'pickup'
        ? [parseFloat(pickupLat), parseFloat(pickupLng)]
        : [parseFloat(dropoffLat), parseFloat(dropoffLng)];

    const destinationLabel = navigationType === 'pickup' ? (isCustomerView ? 'PICKUP POINT' : 'PICKUP') : 'HOTEL';
    const currentInstruction = routeInfo?.instructions?.[0];

    // Validate coordinates
    const isValidCoordinate = (coord) => typeof coord === 'number' && !isNaN(coord);
    const hasValidDestination = isValidCoordinate(destination[0]) && isValidCoordinate(destination[1]);
    const hasValidOrigin = userLocation !== null && isValidCoordinate(userLocation[0]) && isValidCoordinate(userLocation[1]);

    useEffect(() => {
        // Skip geolocation if remote origin is provided
        if (remoteOrigin) return;

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                        setLoading(false);
                    },
                    () => {
                        // Fallback
                        if (pickupLat) setUserLocation([parseFloat(pickupLat), parseFloat(pickupLng)]);
                        setLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            }
        };

        updateLocation();
        const interval = setInterval(updateLocation, 3000); // Faster updates
        return () => clearInterval(interval);
    }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

    if (loading) {
        return (
            <div className={`${isMobile ? 'fixed inset-0 z-50' : 'h-[500px]'} bg-navy flex items-center justify-center`}>
                <div className="text-center">
                    <Loader className="animate-spin text-white mx-auto mb-4" size={32} />
                    <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Waking up GPS...</p>
                </div>
            </div>
        );
    }

    const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka default
    const mapCenter = (userLocation && isValidCoordinate(userLocation[0])) ? userLocation : (hasValidDestination ? destination : DEFAULT_CENTER);
    const activeZoom = isStarted ? 18 : 15;

    // Mobile Full-screen Version
    if (isMobile) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-navy"
            >
                {/* Map */}
                <div className="absolute inset-0">
                    <MapContainer
                        center={mapCenter}
                        zoom={activeZoom}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        {isStarted ? (
                            <RecenterMap center={userLocation} />
                        ) : (
                            <RecenterMap center={mapCenter} />
                        )}

                        {hasValidOrigin && hasValidDestination && (
                            <RoutingMachine
                                origin={userLocation}
                                destination={destination}
                                onRouteCalculated={setRouteInfo}
                            />
                        )}

                        {userLocation && (
                            <Marker position={userLocation} icon={userIcon}>
                                <Popup autoPan={false}>Rider (You)</Popup>
                            </Marker>
                        )}
                        {destination && (
                            <Marker position={destination} icon={destinationIcon}>
                                <Popup autoPan={false}>{destinationLabel === 'PICKUP' ? 'Customer Pickup' : 'Hotel Destination'}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-navy via-navy/80 to-transparent pt-12 pb-16 px-6 z-[10000]">
                    <div className="flex items-center justify-between">
                        {isStarted && currentInstruction ? (
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex-1 mr-4 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20"
                            >
                                <p className="text-[9px] text-accent font-black uppercase tracking-[0.2em] mb-1">{isCustomerView ? 'DRIVER PASSING' : 'NEXT TURN'}</p>
                                <h2 className="text-lg font-black text-white leading-tight uppercase italic">{currentInstruction.text}</h2>
                            </motion.div>
                        ) : (
                            <div>
                                <p className="text-[10px] text-accent font-black uppercase tracking-widest bg-navy/50 w-fit px-2 py-0.5 rounded-full mb-1">
                                    {isCustomerView ? 'TRACKING DRIVER' : (navigationType === 'pickup' ? 'GOING TO PICKUP' : 'GOING TO HOTEL')}
                                </p>
                                <h2 className="text-xl font-black text-white">{isCustomerView ? 'Driver on the way' : (customerName || 'Customer')}</h2>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="w-12 h-12 bg-white/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-white border border-white/10 backdrop-blur-md"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Bottom Info Card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-[10000]">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                        <div className="flex items-center gap-5 mb-5">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <Navigation size={32} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">REACHING {destinationLabel} IN</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-secondary leading-none">
                                        {routeInfo ? routeInfo.duration : '--'}
                                    </p>
                                    <p className="text-sm font-black text-gray-400 italic">min</p>
                                    <p className="text-xs font-bold text-indigo-600 ml-auto bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                                        {routeInfo ? `${routeInfo.distance} km` : 'Searching...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {isStarted ? (
                                <button
                                    onClick={() => setIsStarted(false)}
                                    className="flex-1 bg-red-500 text-white py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                                >
                                    STOP NAVIGATION
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 bg-white/10 text-white border border-white/10 py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                                    >
                                        BACK
                                    </button>
                                    <button
                                        onClick={() => setIsStarted(true)}
                                        className="flex-[2] bg-indigo-600 text-white py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Navigation size={18} fill="currentColor" /> {isCustomerView ? 'LIVE TRACK' : 'START RIDE'}
                                    </button>
                                </>
                            )}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${destination[0]},${destination[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 active:bg-gray-100 transition-all shadow-sm"
                                title="Open in Maps"
                            >
                                <MapPin size={24} />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Desktop Embedded Version
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[600px] rounded-3xl overflow-hidden border-2 border-white shadow-2xl"
        >
            {/* Map */}
            <MapContainer
                center={mapCenter}
                zoom={activeZoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {isStarted ? (
                    <RecenterMap center={userLocation} />
                ) : (
                    <RecenterMap center={mapCenter} />
                )}

                {hasValidOrigin && hasValidDestination && (
                    <RoutingMachine
                        origin={userLocation}
                        destination={destination}
                        onRouteCalculated={setRouteInfo}
                    />
                )}

                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup autoPan={false}>You are here</Popup>
                    </Marker>
                )}
                {destination && (
                    <Marker position={destination} icon={destinationIcon}>
                        <Popup autoPan={false}>{destinationLabel === 'PICKUP' ? 'Pick up Customer here' : 'Drop off at Hotel'}</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Top Header */}
            {!hideUI && (
                <div className="absolute top-8 left-8 right-8 z-[10000]">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white flex items-center justify-between">
                        <div className="flex items-center gap-5 flex-1">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <Navigation size={28} />
                            </div>
                            {isStarted && currentInstruction ? (
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">{isCustomerView ? 'LATEST POINT' : 'NEXT DIRECTION'}</p>
                                    <p className="text-xl font-black text-secondary uppercase italic">{currentInstruction.text}</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">{isCustomerView ? 'DRIVER ARRIVING' : `REACHING ${destinationLabel} IN`}</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-4xl font-black text-secondary leading-none">
                                            {routeInfo ? `${routeInfo.duration} minutes` : '--'}
                                        </p>
                                        <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                            {routeInfo ? `${routeInfo.distance} km` : 'Searching path...'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-secondary hover:shadow-lg transition-all border border-gray-100 ml-4"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            {!hideUI && (
                <div className="absolute bottom-8 left-8 right-8 z-[10000]">
                    <div className="bg-secondary/95 backdrop-blur-xl text-white rounded-3xl p-6 shadow-2xl flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <Clock size={24} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest opacity-60 font-black mb-1">ACTIVE NAVIGATION</p>
                                <p className="font-black text-white uppercase italic text-lg tracking-tighter">{customerName || 'Customer'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {isStarted ? (
                                <button
                                    onClick={() => setIsStarted(false)}
                                    className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-500/20 border border-white/20"
                                >
                                    STOP NAVIGATION
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsStarted(true)}
                                    className="bg-accent text-navy px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20 border border-white/20 flex items-center gap-2"
                                >
                                    <Navigation size={16} fill="currentColor" /> {isCustomerView ? 'LIVE TRACK' : 'START RIDE'}
                                </button>
                            )}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${destination[0]},${destination[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                            >
                                <MapPin size={16} /> OUTER MAPS
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default EmbeddedNavigation;
