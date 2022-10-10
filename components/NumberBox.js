import { useEffect } from "react"

export const NumberBox = ({ num, unit, flip }) => {
    return (
        <div className="flex flex-col items-center px-2 pb-4">
            <div className=" relative bg-transparent flex flex-col items-center justify-center rounded-lg text-sm md:text-sm mt-4 ">
                <div className="rounded-t-[4px] rounded-b-[4px] bg-[#333333] w-8 h-8 "></div>
                <div className="text-sm absolute text-rose-500 z-10 font-bold  md:text-sm">
                    {num}
                </div>
                <div
                    className={`absolute  w-full h-1/2 top-0  rounded-t-[4px] z-5 ${
                        flip ? "animate-flip bg-[#404040]" : "bg-transparent"
                    }`}
                ></div>
                <div className="absolute right-[-3px] top-[14px] rounded-full w-[5px] h-[5px] bg-[#252526]"></div>
                <div className="absolute left-[-3px] top-[14px] rounded-full w-[5px] h-[5px] bg-[#252526]"></div>
            </div>
            <p className="text-sm sm:text-[7px] font-bold text-[#6e767d]">{unit}</p>
        </div>
    )
}
