const HeartFill = ({ size = 72, color = "#f43f5E", ...props }) => (
    <div className="mt-[-2rem] ml-[-2.6rem]  -z-2">
        <svg
            width={size}
            height={size}
            fill={color}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                d="M3.806 6.206a4.8 4.8 0 0 1 6.788 0L12 7.612l1.406-1.406a4.8 4.8 0 1 1 6.788 6.788L12 21.188l-8.194-8.194a4.8 4.8 0 0 1 0-6.788Z"
                clipRule="evenodd"
            />
        </svg>
    </div>
)

export default HeartFill
