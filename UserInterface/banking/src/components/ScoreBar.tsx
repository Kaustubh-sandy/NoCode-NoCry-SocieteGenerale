export default function ScoreBar({
  value,
  max = 100,
  label,
  color = "#E9041E",
}: {
  value: number;
  max?: number;
  label?: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span className="text-xs font-semibold text-gray-700">
            {value.toFixed(0)}
          </span>
        </div>
      )}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
