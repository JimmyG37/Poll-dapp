import { useEffect, useState } from "react"
import DollarSign from "../styles/DollarSign"
import PostSkeleton from "../styles/PostSkeleton"
import Heart from "../styles/Heart"
import ChatBubble from "../styles/ChatBubble"

export default function Logo() {
    const [hour, setHour] = useState("")
    const [minutes, setMinutes] = useState("")
    const [seconds, setSeconds] = useState("")
    const [nHour, setNHour] = useState("")
    const [nMinutes, setNMinutes] = useState("")
    const [nSeconds, setNSeconds] = useState("")

    const clock = () => {
        let date = new Date()

        let hh = date.getHours() * 30,
            mm = date.getMinutes() * 6,
            ss = date.getSeconds() * 6

        setHour(`rotateZ(${hh + mm / 12}deg)`)
        setMinutes(`rotateZ(${mm}deg)`)
        setSeconds(`rotateZ(${ss}deg)`)

        setNHour(`rotateZ(-${hh + mm / 12}deg)`)
        setNMinutes(`rotateZ(-${mm}deg)`)
        setNSeconds(`rotateZ(-${ss}deg)`)
    }
    setInterval(clock, 1000)

    return (
        <div className="flex">
            <div className="relative w-[90px] h-[90px]  rounded-[50%] justify-center flex items-center transition duration-150">
                <div
                    className="absolute flex justify-center w-[105px] h-[90px] before:content-[''] before:absolute  before:w-[0.135rem] before:h-[3.5rem] before:rounded-[0.75rem] before:z-[1] before:bg-[#1d9bf0]"
                    style={{ transform: hour }}
                >
                    <div className="absolute -top-4" style={{ transform: nHour }}>
                        <ChatBubble />
                    </div>
                </div>
                <div className="border-2 border-solid border-[#1d9bf0] z-[10]">
                    <PostSkeleton />
                </div>

                <div
                    className="absolute flex justify-center w-[136px] h-[90px] before:content-['']  before:absolute  before:w-[0.135rem] before:h-[3.5rem] before:rounded-[0.75rem] before:z-[1] before:bg-[#1d9bf0]"
                    style={{ transform: minutes }}
                >
                    <div className="absolute -top-4" style={{ transform: nMinutes }}>
                        <Heart />
                    </div>
                </div>
                <div
                    className="absolute  flex justify-center w-[130px] h-[90px] before:content-[''] before:w-[0.135rem] before:h-[3.5rem] before:rounded-[0.75rem] before:z-[1] origin-center before:bg-[#1d9bf0]"
                    style={{ transform: seconds }}
                >
                    <div className="absolute -top-4" style={{ transform: nSeconds }}>
                        <DollarSign />
                    </div>
                </div>
            </div>
        </div>
    )
}
