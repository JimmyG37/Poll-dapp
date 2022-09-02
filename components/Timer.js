import { useEffect, useState } from "react"
import { CountdownCircleTimer } from "react-countdown-circle-timer"

const minuteSeconds = 60
const hourSeconds = 3600
const daySeconds = 86400

const getTimeSeconds = (time) => (minuteSeconds - time) | 0
const getTimeMinutes = (time) => ((time % hourSeconds) / minuteSeconds) | 0
const getTimeHours = (time) => ((time % daySeconds) / hourSeconds) | 0
const getTimeDays = (time) => (time / daySeconds) | 0

const renderTime = (time) => {
    return (
        <div className="text-sm sm:text-[12px]">
            <div>{time}</div>
        </div>
    )
}

export default function Timer({ deadline }) {
    let deadlineDate = new Date(deadline * 1000)
    let currentDate = new Date()
    let dateDiff = deadlineDate.getTime() - currentDate.getTime()
    let secDiff = dateDiff / 1000
    let timeRemaining = Math.abs(secDiff)
    let days = Math.ceil(timeRemaining / daySeconds)
    let hours = Math.floor(timeRemaining / hourSeconds)
    let minutes = Math.floor((timeRemaining % hourSeconds) / minuteSeconds)
    let seconds = timeRemaining % minuteSeconds
    let daysDuration = days * daySeconds
    let hoursDuration = hours * hourSeconds
    let minutesDuration = minutes * minuteSeconds

    return (
        <div className="flex">
            <CountdownCircleTimer
                isPlaying
                duration={daysDuration}
                initialRemainingTime={timeRemaining}
                colors="#7E2E84"
                strokeWidth={1.8}
                size={24.5}
            >
                {({ elapsedTime, color }) => (
                    <span style={{ color }}>
                        {renderTime(getTimeDays(daysDuration - elapsedTime))}
                    </span>
                )}
            </CountdownCircleTimer>
            <div className="ml-3 mr-8 mt-0.5 text-[#6e767d] text-sm sm:text-[15px]">days</div>
            <CountdownCircleTimer
                isPlaying
                colors="#D14081"
                duration={hoursDuration}
                strokeWidth={1.8}
                size={24.5}
                onComplete={(totalElapsedTime) => ({
                    shouldRepeat: timeRemaining - totalElapsedTime > hourSeconds,
                })}
            >
                {({ elapsedTime, color }) => (
                    <span style={{ color }}>
                        {renderTime(getTimeHours(hoursDuration - elapsedTime))}
                    </span>
                )}
            </CountdownCircleTimer>
            <div className="ml-3 mr-8 mt-0.5 text-[#6e767d] text-sm sm:text-[15px]">hours</div>
            <CountdownCircleTimer
                isPlaying
                colors="#EF798A"
                duration={minutesDuration}
                strokeWidth={1.8}
                size={24.5}
                onComplete={(totalElapsedTime) => ({
                    shouldRepeat: timeRemaining - totalElapsedTime > minuteSeconds,
                })}
            >
                {({ elapsedTime, color }) => (
                    <span style={{ color }}>
                        {renderTime(getTimeMinutes(minutesDuration - elapsedTime))}
                    </span>
                )}
            </CountdownCircleTimer>
            <div className="ml-3 mr-5 mt-0.5 text-[#6e767d] text-sm sm:text-[15px]">minutes</div>
        </div>
    )
}
