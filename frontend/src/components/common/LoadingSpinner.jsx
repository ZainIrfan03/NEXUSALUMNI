import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  label = "Loading...",
  size = 18,
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-center py-16 text-gray-400 gap-2 ${className}`}
    >
      <Loader2 size={size} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}
