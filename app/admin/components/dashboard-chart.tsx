"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function DashboardChart({ data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!data || !chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels || [],
        datasets: [
          {
            label: data.datasets?.[0]?.label || "New Employees",
            data: data.datasets?.[0]?.data || [],
            borderColor: "#008751",
            backgroundColor: "rgba(0, 135, 81, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#008751",
            pointBorderColor: "#fff",
            pointBorderWidth: 1,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          ...(data.datasets?.[1]
            ? [
                {
                  label: data.datasets[1].label || "Documents Processed",
                  data: data.datasets[1].data || [],
                  borderColor: "#666",
                  backgroundColor: "rgba(102, 102, 102, 0.1)",
                  borderWidth: 2,
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: "#666",
                  pointBorderColor: "#fff",
                  pointBorderWidth: 1,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 6,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            titleColor: "#333",
            bodyColor: "#666",
            borderColor: "#ddd",
            borderWidth: 1,
            padding: 10,
            boxPadding: 5,
            usePointStyle: true,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              precision: 0,
              font: {
                size: 11,
              },
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        elements: {
          line: {
            borderJoinStyle: "round",
          },
        },
        animation: {
          duration: 1000,
        },
      },
    })

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
