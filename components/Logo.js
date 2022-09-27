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

    useEffect(() => {
        const date = new Date()
        const interval = setInterval(() => {
            let hh = date.getHours() * 30,
                mm = date.getMinutes() * 6,
                ss = date.getSeconds() * 6

            setHour(`rotateZ(${hh + mm / 12}deg)`)
            setMinutes(`rotateZ(${mm}deg)`)
            setSeconds(`rotateZ(${ss}deg)`)

            setNHour(`rotateZ(-${hh + mm / 12}deg)`)
            setNMinutes(`rotateZ(-${mm}deg)`)
            setNSeconds(`rotateZ(-${ss}deg)`)
        }, 1000)

        return () => clearInterval(interval)
    }, [hour, minutes, seconds, nHour, nMinutes, nSeconds])

    return (
        <div>
            <div className="relative w-[80px] h-[80px]  rounded-[50%] justify-center flex items-center transition duration-150">
                <div
                    className={
                        "absolute flex justify-center w-[105px] h-[60px] before:content-[''] before:absolute  before:w-[0.135rem] before:h-[3.5rem] before:rounded-[0.75rem] before:z-[1] "
                    }
                    style={{ transform: hour }}
                >
                    <div
                        className="absolute -top-4 border-2 border-[#1d9bf0]"
                        style={{ transform: nHour }}
                    >
                        <ChatBubble />
                    </div>
                </div>
                <div className="w-11 border-2 border-[#1d9bf0] bg-white h-6">
                    <PostSkeleton />
                </div>

                <div
                    className="absolute flex justify-center w-[136px] h-[52px] before:content-['']  before:absolute  before:w-[0.135rem] before:h-[3.5rem] before:rounded-[0.75rem] before:z-[1]"
                    style={{ transform: minutes }}
                >
                    <div
                        className="absolute -top-4 border-2 border-[#1d9bf0]"
                        style={{ transform: nMinutes }}
                    >
                        <Heart />
                    </div>
                </div>
                <div
                    className="absolute flex justify-center w-[130px] h-[58px] before:content-[''] before:w-[0.135rem] before:h-[2.5rem] before:rounded-[0.75rem] before:z-[1] origin-center "
                    style={{ transform: seconds }}
                >
                    <div
                        className="absolute -top-4 border-2 border-[#1d9bf0] bg-white"
                        style={{ transform: nSeconds }}
                    >
                        <DollarSign />
                    </div>
                </div>
            </div>
        </div>
    )
}
