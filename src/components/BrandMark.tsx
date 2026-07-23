type BrandMarkProps = {
  size?: "compact" | "large";
};

export function BrandMark({ size = "compact" }: BrandMarkProps) {
  return (
    <div className={`brand-mark brand-mark--${size}`} aria-label="Octagon HQ">
      <span className="brand-mark__octagon" aria-hidden="true">HQ</span>
      <span className="brand-mark__name">Octagon HQ</span>
    </div>
  );
}
