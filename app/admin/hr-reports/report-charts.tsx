"use client"

export function BarChart({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <rect x="50" y="20" width="40" height="230" fill="#10b981" rx="4" />
        <rect x="100" y="60" width="40" height="190" fill="#10b981" rx="4" />
        <rect x="150" y="100" width="40" height="150" fill="#10b981" rx="4" />
        <rect x="200" y="140" width="40" height="110" fill="#10b981" rx="4" />
        <rect x="250" y="80" width="40" height="170" fill="#10b981" rx="4" />
        <rect x="300" y="40" width="40" height="210" fill="#10b981" rx="4" />

        {/* X-axis */}
        <line x1="30" y1="250" x2="370" y2="250" stroke="#e5e7eb" strokeWidth="2" />

        {/* Y-axis */}
        <line x1="30" y1="20" x2="30" y2="250" stroke="#e5e7eb" strokeWidth="2" />

        {/* X-axis labels */}
        <text x="70" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Jan
        </text>
        <text x="120" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Feb
        </text>
        <text x="170" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Mar
        </text>
        <text x="220" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Apr
        </text>
        <text x="270" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          May
        </text>
        <text x="320" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Jun
        </text>

        {/* Y-axis labels */}
        <text x="20" y="250" textAnchor="end" fontSize="12" fill="#6b7280">
          0
        </text>
        <text x="20" y="200" textAnchor="end" fontSize="12" fill="#6b7280">
          25
        </text>
        <text x="20" y="150" textAnchor="end" fontSize="12" fill="#6b7280">
          50
        </text>
        <text x="20" y="100" textAnchor="end" fontSize="12" fill="#6b7280">
          75
        </text>
        <text x="20" y="50" textAnchor="end" fontSize="12" fill="#6b7280">
          100
        </text>
      </svg>
    </div>
  )
}

export function LineChart({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        <line x1="50" y1="50" x2="350" y2="50" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="50" y1="100" x2="350" y2="100" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="50" y1="150" x2="350" y2="150" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="50" y1="200" x2="350" y2="200" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="50" y1="250" x2="350" y2="250" stroke="#e5e7eb" strokeWidth="1" />

        <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="100" y1="50" x2="100" y2="250" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="150" y1="50" x2="150" y2="250" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="200" y1="50" x2="200" y2="250" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="250" y1="50" x2="250" y2="250" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="300" y1="50" x2="300" y2="250" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="350" y1="50" x2="350" y2="250" stroke="#e5e7eb" strokeWidth="1" />

        {/* Line */}
        <path
          d="M50,180 L100,150 L150,170 L200,120 L250,90 L300,110 L350,80"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
        />

        {/* Data points */}
        <circle cx="50" cy="180" r="5" fill="#10b981" />
        <circle cx="100" cy="150" r="5" fill="#10b981" />
        <circle cx="150" cy="170" r="5" fill="#10b981" />
        <circle cx="200" cy="120" r="5" fill="#10b981" />
        <circle cx="250" cy="90" r="5" fill="#10b981" />
        <circle cx="300" cy="110" r="5" fill="#10b981" />
        <circle cx="350" cy="80" r="5" fill="#10b981" />

        {/* X-axis labels */}
        <text x="50" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Jan
        </text>
        <text x="100" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Feb
        </text>
        <text x="150" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Mar
        </text>
        <text x="200" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Apr
        </text>
        <text x="250" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          May
        </text>
        <text x="300" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Jun
        </text>
        <text x="350" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">
          Jul
        </text>

        {/* Y-axis labels */}
        <text x="40" y="250" textAnchor="end" fontSize="12" fill="#6b7280">
          0
        </text>
        <text x="40" y="200" textAnchor="end" fontSize="12" fill="#6b7280">
          20
        </text>
        <text x="40" y="150" textAnchor="end" fontSize="12" fill="#6b7280">
          40
        </text>
        <text x="40" y="100" textAnchor="end" fontSize="12" fill="#6b7280">
          60
        </text>
        <text x="40" y="50" textAnchor="end" fontSize="12" fill="#6b7280">
          80
        </text>
      </svg>
    </div>
  )
}

export function PieChart({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        {/* Pie chart */}
        <g transform="translate(200, 150)">
          {/* Slices */}
          <path d="M0,0 L0,-100 A100,100 0 0,1 86.6,-50 z" fill="#10b981" />
          <path d="M0,0 L86.6,-50 A100,100 0 0,1 86.6,50 z" fill="#3b82f6" />
          <path d="M0,0 L86.6,50 A100,100 0 0,1 0,100 z" fill="#f59e0b" />
          <path d="M0,0 L0,100 A100,100 0 0,1 -86.6,50 z" fill="#ef4444" />
          <path d="M0,0 L-86.6,50 A100,100 0 0,1 -86.6,-50 z" fill="#8b5cf6" />
          <path d="M0,0 L-86.6,-50 A100,100 0 0,1 0,-100 z" fill="#ec4899" />
        </g>

        {/* Legend */}
        <g transform="translate(320, 100)">
          <rect x="0" y="0" width="15" height="15" fill="#10b981" />
          <text x="25" y="12" fontSize="12" fill="#6b7280">
            Category 1 (30%)
          </text>

          <rect x="0" y="25" width="15" height="15" fill="#3b82f6" />
          <text x="25" y="37" fontSize="12" fill="#6b7280">
            Category 2 (20%)
          </text>

          <rect x="0" y="50" width="15" height="15" fill="#f59e0b" />
          <text x="25" y="62" fontSize="12" fill="#6b7280">
            Category 3 (15%)
          </text>

          <rect x="0" y="75" width="15" height="15" fill="#ef4444" />
          <text x="25" y="87" fontSize="12" fill="#6b7280">
            Category 4 (15%)
          </text>

          <rect x="0" y="100" width="15" height="15" fill="#8b5cf6" />
          <text x="25" y="112" fontSize="12" fill="#6b7280">
            Category 5 (10%)
          </text>

          <rect x="0" y="125" width="15" height="15" fill="#ec4899" />
          <text x="25" y="137" fontSize="12" fill="#6b7280">
            Category 6 (10%)
          </text>
        </g>
      </svg>
    </div>
  )
}
