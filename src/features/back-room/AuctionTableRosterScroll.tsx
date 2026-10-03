import type { ReactNode } from "react";
import "../../styles/weekly-auction-table-shared.css";

export function AuctionTableRosterScroll({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={["weekly-auction-table__roster-scroll", className].filter(Boolean).join(" ")}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
