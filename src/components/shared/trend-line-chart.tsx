interface TrendPoint {
  label: string
  value: number
}

interface TrendLineChartProps {
  data: TrendPoint[]
  width?: number
  height?: number
}

export function TrendLineChart({ data, width = 780, height = 200 }: TrendLineChartProps) {
  const padding = 10
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2
  const values = data.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((point, index) => {
    const x = padding + (index * innerWidth) / (data.length - 1 || 1)
    const y = padding + innerHeight - ((point.value - min) / range) * innerHeight
    return { x, y }
  })

  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPoints = `${linePoints} ${width - padding},${height - padding} ${padding},${height - padding}`
  const gridLines = [0, 1, 2, 3].map((i) => padding + (i * innerHeight) / 3)

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Requests trend chart" preserveAspectRatio="none">
        {gridLines.map((y) => (
          <line key={y} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--rf-border)" strokeWidth={1} />
        ))}
        <polygon points={areaPoints} fill="var(--rf-accent-subtle)" opacity={0.6} />
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--rf-accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, index) => (
          <circle key={data[index].label} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke="var(--rf-accent)" strokeWidth={2} />
        ))}
      </svg>
      <div className="trend-chart-labels">
        {data.map((point) => (
          <div key={point.label} style={{ flex: 1, textAlign: 'center' }}>
            {point.label}
          </div>
        ))}
      </div>
    </div>
  )
}
