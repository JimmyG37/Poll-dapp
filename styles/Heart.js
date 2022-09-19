import * as React from "react"

const Heart = ({ size = 13, strokeWidth = 3.5, color = "#1d9bf0", ...props }) => (
    <div className="border-2 border-[#1d9bf0] h-4 w-4 px-0 items-center">
        <svg
            width={size}
            height={size}
            fill="none"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M19.5 13.576a4.976 4.976 0 0 0 1.495-3.704A5 5 0 0 0 12 7.01a5 5 0 1 0-7.5 6.566l7.5 7.428 7.5-7.428Z" />
        </svg>
    </div>
)

export default Heart
