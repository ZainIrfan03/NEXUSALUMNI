export default function EmptyState({ message, className = "" }) {
  return (
    <p className={`text-sm text-gray-400 py-10 text-center ${className}`}>
      {message}
    </p>
  );
}
