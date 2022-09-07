import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function BarGraph({ likePercent }) {
    const options = {
        indexAxis: "y",
        scales: {
            x: {
                stacked: true,
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
            y: {
                stacked: true,
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
        },
        elements: {
            bar: {
                borderWidth: 0,
            },
        },
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            toolTip: {
                display: false,
            },
        },
    }

    const data = {
        labels: [""],
        datasets: [
            {
                data: [likePercent],
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
                data: [100 - likePercent],
                backgroundColor: "rgb(248, 250, 252)",
            },
        ],
    }

    return (
        <div className="absolute -ml-4 -mt-4">
            <Bar options={options} data={data} />
        </div>
    )
}
