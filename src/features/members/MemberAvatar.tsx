export function MemberAvatar({
  photoData,
  initials,
  className = "",
  label,
}: {
  photoData?: string | null;
  initials: string;
  className?: string;
  label?: string;
}) {
  return (
    <span className={`member-avatar${className ? ` ${className}` : ""}`} aria-label={label}>
      {photoData ? <img src={photoData} alt={label ?? "Member avatar"} /> : <span>{initials}</span>}
    </span>
  );
}
