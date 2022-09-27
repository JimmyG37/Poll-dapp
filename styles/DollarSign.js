import * as React from "react"

const DollarSign = ({ size = 12, strokeWidth = 3.5, color = "#1d9bf0", ...props }) => (
    <div>
        <svg
            width={size}
            height={size}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    </div>
)

export default DollarSign
