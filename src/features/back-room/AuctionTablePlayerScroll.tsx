import type { ReactNode } from "react";
import "../../styles/weekly-auction-table-shared.css";

export function AuctionTablePlayerScroll({
  className,
  expanded,
  children,
}: {
  className?: string;
  expanded: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={[
        "weekly-auction-table__player-scroll",
        className,
        expanded ? "is-expanded" : "",
      ].filter(Boolean).join(" ")}
    >
      {children}
    </article>
  );
}
