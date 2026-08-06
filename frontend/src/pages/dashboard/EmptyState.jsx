import React from "react";

/**
 * Shared "nothing to show" message for dashboard lists (jobs, applicants,
 * mentorship requests, directory results, messages, etc).
 * Replaces the copy-pasted `<p className="text-sm text-gray-400 py-10 text-center">...</p>`
 * block that used to be repeated in every page.
 *
 * Usage:
 *   {items.length === 0 ? <EmptyState message="No jobs posted yet in this category." /> : ...}
 */
export default function EmptyState({ message, className = "" }) {
  return (
    <p className={`text-sm text-gray-400 py-10 text-center ${className}`}>
      {message}
    </p>
  );
}