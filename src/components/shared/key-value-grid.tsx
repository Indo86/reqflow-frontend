interface KeyValueGridProps {
  items: { label: string; value: string }[]
}

export function KeyValueGrid({ items }: KeyValueGridProps) {
  return (
    <div className="kv-grid">
      {items.map(({ label, value }) => (
        <div className="kv-item" key={label}>
          <span className="kv-label">{label}</span>
          <span className="kv-value">{value}</span>
        </div>
      ))}
    </div>
  )
}
