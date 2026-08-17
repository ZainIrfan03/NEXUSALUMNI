export default function UserAvatar({ name = "User", src, className = "h-10 w-10", imageClassName = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0 ${imageClassName}`}
      />
    );
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

  return (
    <div
      role="img"
      aria-label={`${name} has not uploaded a profile picture`}
      className={`${className} rounded-full bg-gray-100 text-gray-500 font-semibold flex items-center justify-center shrink-0 ${imageClassName}`}
    >
      {initials}
    </div>
  );
}
