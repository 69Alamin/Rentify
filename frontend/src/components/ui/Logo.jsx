import React from 'react';

const Logo = ({ className = "w-12 h-12", isDark = false, showText = false, textColor = "text-secondary" }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative w-full h-full flex-shrink-0">
                {/* Background Shape */}
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-xl"
                >
                    <rect width="100" height="100" rx="24" fill={isDark ? "#ffffff" : "#0f172a"} />

                    {/* Abstract 'Q' + House + Speed Motif */}
                    <path
                        d="M30 35C30 32.2386 32.2386 30 35 30H65C67.7614 30 70 32.2386 70 35V65C70 67.7614 67.7614 70 65 70H55L40 85V70H35C32.2386 70 30 67.7614 30 65V35Z"
                        fill={isDark ? "#0f172a" : "#f97316"}
                    />

                    {/* Inner Bolt Icon (Speed) */}
                    <path
                        d="M55 40L40 55H50L45 65L60 50H50L55 40Z"
                        fill="white"
                    />

                    {/* Decorative Dot */}
                    <circle cx="75" cy="25" r="8" fill="#f97316" className="animate-pulse" />
                </svg>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className={`text-2xl font-black tracking-tighter leading-none italic ${textColor}`}>
                        Quickrent
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
                        Aura Experience
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
