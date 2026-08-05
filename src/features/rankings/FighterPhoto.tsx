import { useEffect, useRef, useState, type CSSProperties } from "react";
import { blackCompositeEdgeBackground } from "./fighterPhotoProcessing";

type FighterPhotoProps = {
  name: string;
  src: string;
  className?: string;
  style?: CSSProperties;
};

function isThumbnailAsset(src: string) {
  return /-thumb\.webp(?:[?#].*)?$/i.test(src);
}

export function FighterPhoto({ name, src, className = "", style }: FighterPhotoProps) {
  const [failed, setFailed] = useState(!src);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processThumbnail = isThumbnailAsset(src);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  useEffect(() => {
    setFailed(!src);
    if (!src || !processThumbnail) return;

    let active = true;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d", { willReadFrequently: true });
      if (!canvas || !context || !image.naturalWidth || !image.naturalHeight) {
        setFailed(true);
        return;
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      blackCompositeEdgeBackground(pixels);
      context.putImageData(pixels, 0, 0);
    };
    image.onerror = () => {
      if (active) setFailed(true);
    };
    image.src = src;

    return () => {
      active = false;
    };
  }, [processThumbnail, src]);

  if (failed || !src) {
    return <span className={`fighter-photo fighter-photo--fallback ${className}`} style={style}>{initials}</span>;
  }

  if (processThumbnail) {
    return (
      <canvas
        ref={canvasRef}
        className={`fighter-photo ${className}`}
        style={{ background: "#000", ...style }}
        aria-hidden="true"
      />
    );
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
