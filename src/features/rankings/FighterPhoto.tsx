import { useState } from "react";

type FighterPhotoProps = {
  name: string;
  src: string;
  className?: string;
};

export function FighterPhoto({ name, src, className = "" }: FighterPhotoProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (failed) {
    return <span className={`fighter-photo fighter-photo--fallback ${className}`}>{initials}</span>;
  }

  return (
    <img
      className={`fighter-photo ${className}`}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
