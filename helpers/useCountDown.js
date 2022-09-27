import { useEffect, useState } from "react"

const useCountdown = (deadline) => {
    const [countDown, setCountDown] = useState(null)

    useEffect(() => {
        const countDownDate = new Date(deadline * 1000).getTime()
        setCountDown(countDownDate - new Date().getTime())

        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [deadline])

    return getReturnValues(countDown)
}

const getReturnValues = (countDown) => {
    let days = Math.floor(countDown / (1000 * 60 * 60 * 24))
    let hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((countDown % (1000 * 60)) / 1000)

    return [days, hours, minutes, seconds]
}

export { useCountdown }
