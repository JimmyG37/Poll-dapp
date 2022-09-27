import * as React from "react"

const ChatBubble = ({ size = 13, strokeWidth = 3, color = "#1d9bf0", ...props }) => (
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
            <path d="M8.824 18.588 4 21l.653-4.573C3.006 15.001 2 13.095 2 11c0-4.418 4.477-8 10-8s10 3.582 10 8-4.477 8-10 8c-1.11 0-2.178-.145-3.176-.412Z" />
        </svg>
    </div>
)

export default ChatBubble
