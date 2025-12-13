"use client";

interface RobotMascotProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function RobotMascot({ className = "", size = "md" }: RobotMascotProps) {
    const sizeClasses = {
        sm: "w-16 h-20",
        md: "w-24 h-28",
        lg: "w-32 h-40",
    };

    return (
        <div className={`${sizeClasses[size]} ${className} animate-float`}>
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Antenna */}
                <g className="antenna">
                    <line x1="50" y1="8" x2="50" y2="20" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="50" cy="5" r="4" fill="#ff6b35">
                        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                </g>
                
                {/* Head */}
                <rect x="20" y="20" width="60" height="45" rx="8" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="2" />
                
                {/* Face screen */}
                <rect x="26" y="26" width="48" height="33" rx="4" fill="#0a0a0b" />
                
                {/* Eyes */}
                <g className="eyes">
                    {/* Left eye */}
                    <circle cx="38" cy="42" r="8" fill="#ff6b35">
                        <animate attributeName="r" values="8;7;8" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="40" cy="40" r="3" fill="#0a0a0b" />
                    <circle cx="41" cy="39" r="1.5" fill="#fff" opacity="0.8" />
                    
                    {/* Right eye */}
                    <circle cx="62" cy="42" r="8" fill="#ff6b35">
                        <animate attributeName="r" values="8;7;8" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="64" cy="40" r="3" fill="#0a0a0b" />
                    <circle cx="65" cy="39" r="1.5" fill="#fff" opacity="0.8" />
                </g>
                
                {/* Ear panels */}
                <rect x="10" y="30" width="8" height="25" rx="2" fill="#1a1a1e" stroke="#ff6b35" strokeWidth="1.5" />
                <rect x="82" y="30" width="8" height="25" rx="2" fill="#1a1a1e" stroke="#ff6b35" strokeWidth="1.5" />
                
                {/* Neck connector */}
                <rect x="40" y="65" width="20" height="8" rx="2" fill="#2a2a30" />
                
                {/* Body */}
                <rect x="22" y="73" width="56" height="40" rx="6" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="2" />
                
                {/* Chest panel */}
                <rect x="30" y="79" width="40" height="28" rx="4" fill="#0a0a0b" />
                
                {/* Chest light / power core */}
                <circle cx="50" cy="93" r="8" fill="#ff6b35" opacity="0.3">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="93" r="5" fill="#ff6b35">
                    <animate attributeName="r" values="5;4;5" dur="1.5s" repeatCount="indefinite" />
                </circle>
                
                {/* Status indicators on chest */}
                <circle cx="38" cy="85" r="2" fill="#22c55e">
                    <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="85" r="2" fill="#ff6b35">
                    <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="62" cy="85" r="2" fill="#22c55e">
                    <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
                </circle>
                
                {/* Arms */}
                <rect x="8" y="78" width="12" height="25" rx="4" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="1.5" />
                <rect x="80" y="78" width="12" height="25" rx="4" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="1.5" />
                
                {/* Hand accents */}
                <circle cx="14" cy="100" r="3" fill="#ff6b35" opacity="0.6" />
                <circle cx="86" cy="100" r="3" fill="#ff6b35" opacity="0.6" />
            </svg>
        </div>
    );
}

