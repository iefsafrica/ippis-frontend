"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface DashboardChartDataset {
  label?: string
  data?: number[]
}

interface DashboardChartData {
  labels?: string[]
  datasets?: DashboardChartDataset[]
}

export function DashboardChart({ data }: { data: DashboardChartData }) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!data || !chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const palette = ["#10B981", "#0B4628", "#34D399"]

    const datasets = (data.datasets || []).map((dataset, idx) => ({
      label: dataset.label || `Series ${idx + 1}`,
      data: dataset.data || [],
      backgroundColor: palette[idx % palette.length],
      hoverBackgroundColor: idx % 2 === 0 ? "#059669" : "#08351E",
      borderRadius: 999,
      borderSkipped: false as const,
      barThickness: 14,
      maxBarThickness: 18,
      categoryPercentage: 0.62,
      barPercentage: 0.72,
    }))

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels || [],
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "start",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 8,
              boxHeight: 8,
              padding: 18,
              color: "#475569",
              font: {
                size: 12,
                weight: 500,
              },
            },
          },
          tooltip: {
            backgroundColor: "#062415",
            titleColor: "#ffffff",
            bodyColor: "#e2e8f0",
            borderColor: "#0B4628",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            displayColors: true,
            usePointStyle: true,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                size: 12,
                weight: 500,
              },
            },
          },
          y: {
            beginAtZero: true,
            border: {
              display: false,
              dash: [4, 4],
            },
            grid: {
              color: "rgba(148, 163, 184, 0.18)",
            },
            ticks: {
              color: "#94a3b8",
              precision: 0,
              font: {
                size: 12,
              },
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        animation: {
          duration: 700,
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="w-full h-[290px]">
      <canvas ref={chartRef} />
    </div>
  )
}
