import * as React from "react"
import { useEffect, useState } from "react"
import Moment from "react-moment"

export default function Calendar({ deadline }) {
    useEffect(() => {}, [deadline])
    return (
        <div className="calendar">
            <div className="calendarDate">
                <Moment unix format="MMM">
                    {deadline}
                </Moment>
            </div>
            <Moment unix format="D">
                {deadline}
            </Moment>
        </div>
    )
}
