interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "#E9041E",
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div
        className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-white text-xl"
        style={{ background: accent }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 leading-none">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
