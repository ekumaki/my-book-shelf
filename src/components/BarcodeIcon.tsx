import React from 'react';

interface BarcodeIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export const BarcodeIcon: React.FC<BarcodeIconProps> = ({
    size = 24,
    color = 'currentColor',
    className = ''
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M4 6V5C4 4.44772 4.44772 4 5 4H8"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 4H19C19.5523 4 20 4.44772 20 5V6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20 18V19C20 19.5523 19.5523 20 19 20H16"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 20H5C4.44772 20 4 19.5523 4 19V18"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Barcode lines */}
            <rect x="7" y="8" width="1.5" height="8" fill={color} />
            <rect x="9.5" y="8" width="1" height="8" fill={color} />
            <rect x="11.5" y="8" width="2" height="8" fill={color} />
            <rect x="14.5" y="8" width="1" height="8" fill={color} />
            <rect x="16.5" y="8" width="1.5" height="8" fill={color} />
        </svg>
    );
};
