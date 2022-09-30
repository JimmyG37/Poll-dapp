import { useEffect } from "react"

export const NumberBox = ({ num, unit, flip }) => {
    return (
        <div className="flex flex-col items-center px-2 pb-4">
            <div className=" relative bg-transparent flex flex-col items-center justify-center rounded-lg text-sm md:text-sm mt-4 ">
                <div className="rounded-t-lg rounded-b-lg bg-[#1d9bf0] w-8 h-8 "></div>
                <div className="text-sm absolute text-white z-10 font-bold  md:text-sm">{num}</div>
                <div
                    className={`absolute  w-full h-1/2 top-0  rounded-t-lg z-5 ${
                        flip ? "animate-flip bg-[#177cc0]" : "bg-transparent"
                    }`}
                ></div>
            </div>
            {/* <p className="text-sm font-semibold text-[#6e767d]">{unit}</p> */}
        </div>
    )
}
