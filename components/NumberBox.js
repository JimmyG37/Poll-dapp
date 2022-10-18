import { useEffect } from "react"

export const NumberBox = ({ num, unit, flip }) => {
    return (
        <div className="countDownContainer">
            <div className="numberBox">
                <div className="innerNumberBox "></div>
                <div className="numberTime">{num}</div>
                <div
                    className={`flipper ${flip ? "animate-flip bg-[#374151]" : "bg-transparent"}`}
                ></div>
                <div className="rightIndent"></div>
                <div className="leftIndent"></div>
            </div>
            <p className="timeLabel">{unit}</p>
        </div>
    )
}
