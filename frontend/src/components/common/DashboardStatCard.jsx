export default function DashboardStatCard({
  label,
  value,
  note,
  icon: Icon,
  variant = "overview",
}) {
  if (variant === "jobs") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="w-9 h-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
            <Icon size={18} />
          </span>
          {note && (
            <span className="text-sm font-medium text-primary">{note}</span>
          )}
        </div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </span>
        <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
          <Icon size={16} />
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {note && <span className="text-sm text-gray-400">{note}</span>}
      </div>
    </div>
  );
}
