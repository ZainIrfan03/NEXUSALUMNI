import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Shared loading indicator for dashboard pages.
 * Replaces the copy-pasted `<Loader2 className="animate-spin" /> Loading...`
 * block that used to be repeated in every page.
 *
 * Usage:
 *   {loading ? <LoadingSpinner label="Loading jobs..." /> : ...}
 */
export default function LoadingSpinner({ label = "Loading...", size = 18, className = "" }) {
  return (
    <div className={`flex items-center justify-center py-16 text-gray-400 gap-2 ${className}`}>
      <Loader2 size={size} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}
