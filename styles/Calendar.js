import { useEffect, useState } from "react"
import Moment from "react-moment"

export default function Calendar({ deadline }) {
    return (
        <div className="flex flex-col justify-center items-center rounded-lg h-10 w-11 shadow-md">
            <div className="flex h-3 w-full pt-2 justify-center items-center  text-rose-500 text-[10px] font-bold ">
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
