import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileHotelCard = ({ hotel }) => {
    return (
        <Link to={`/hotels/${hotel.id}`} className="block w-full h-full">
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden bg-navy-light/50 border border-white/5"
            >
                <img
                    src={hotel.image_url || '/assets/default_hotel.png'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/default_hotel.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-90" />

                <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                    <div className="bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-white">{hotel.rating || 'N/A'}</span>
                    </div>
                    {hotel.ai_confidence === 'High' && (
                        <div className="bg-primary/80 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-[0_0_10px_rgba(79,70,229,0.4)]">
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">★ AI RECOMMENDED</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-bold text-white mb-0.5 truncate leading-tight">
                        {hotel.name}
                    </h3>

                    <div className="flex items-center gap-1 text-gray-400 mb-2">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="text-[10px] truncate">{hotel.address}</span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-sm font-bold text-accent">৳{hotel.price_per_hour}</span>
                            <span className="text-[10px] text-gray-500">/hr</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default MobileHotelCard;
