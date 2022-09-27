export default function PostSkeleton() {
    return (
        <div className="flex pl-1 pt-1 bg-white">
            <svg
                width="12"
                height="10"
                fill="none"
                stroke="#1d9bf0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <path d="M9 9h.01"></path>
                <path d="M15 9h.01"></path>
            </svg>
            <svg
                width="14"
                height="14"
                fill="#1d9bf0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    d="M24 6.35H0v-1.5h24v1.5Zm-14.4 6.4H0v-1.5h9.6v1.5Zm4.8 6.4H0v-1.5h14.4v1.5Z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    )
}
