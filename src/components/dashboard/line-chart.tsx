"use client"

import { Line } from "react-chartjs-2"

interface LineChartProps {
  title: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      fill: boolean
      borderColor: string
      backgroundColor: string
      tension: number
    }[]
  }
}

export function LineChart({ title, data }: LineChartProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <div className="mt-2 h-80">
          <Line data={data} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
