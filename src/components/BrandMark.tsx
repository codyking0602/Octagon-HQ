import { brand } from "../config/brand";

type BrandMarkProps = {
  size?: "compact" | "large";
};

export function BrandMark({ size = "compact" }: BrandMarkProps) {
  return (
    <div className={`brand-mark brand-mark--${size}`} aria-label={brand.name}>
      <img className="brand-mark__logo" src={brand.logoUrl} alt="" decoding="async" />
      <span className="brand-mark__name">{brand.name}</span>
    </div>
  );
}
