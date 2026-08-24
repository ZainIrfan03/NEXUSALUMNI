const TONE_STYLES = {
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-primary",
  neutral: "bg-gray-100 text-gray-500",
  danger: "bg-red-50 text-red-500",
};

export default function StatusBadge({
  label,
  tone = "neutral",
  icon: Icon,
  className = "",
}) {
  const toneClasses = TONE_STYLES[tone] || TONE_STYLES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1.5 ${toneClasses} ${className}`}
    >
      {Icon && <Icon size={11} />}
      {label}
    </span>
  );
}
