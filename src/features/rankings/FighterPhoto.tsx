import { useState, type CSSProperties } from "react";

type FighterPhotoProps = {
  name: string;
  src: string;
  className?: string;
  style?: CSSProperties;
};

export function FighterPhoto({ name, src, className = "", style }: FighterPhotoProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (failed) {
    return <span className={`fighter-photo fighter-photo--fallback ${className}`} style={style}>{initials}</span>;
  }

  return (
    <img
      className={`fighter-photo ${className}`}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
