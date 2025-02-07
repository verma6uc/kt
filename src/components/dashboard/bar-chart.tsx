"use client"

import { Bar } from "react-chartjs-2"

interface BarChartProps {
  title: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string[]
    }[]
  }
}

export function BarChart({ title, data }: BarChartProps) {
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
    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <div className="mt-2 h-80">
          <Bar data={data} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
