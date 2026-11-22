import { Link } from "react-router-dom";
import type { CrownsCard, CrownsData } from "./crownsData";
import { cardLabel, humanize } from "./crownsData";

export function CrownsChecklist({
  cards, data, urls, onOpen, owner,
}: {
  cards: CrownsCard[];
  data: CrownsData;
  urls: Record<string, string>;
  onOpen: (cardId: number) => void;
  owner: boolean;
}) {
  const subjectById = new Map(data.subjects.map(subject => [subject.id, subject]));
  const seriesBySlug = new Map(data.series.map(series => [series.slug, series]));
  return (
    <div className="crowns-checklist" aria-label="CROWNS card checklist">
      {cards.map((card, i) => {
        const subject = subjectById.get(card.subject_id);
        const series = card.series_slug ? seriesBySlug.get(card.series_slug) : null;
        const image = card.front_path ? urls[card.front_path] : null;
        return (
          <article className="crowns-checklist-row" key={card.id}>
            <button type="button" className="crowns-checklist-row__main" onClick={() => onOpen(card.id)}
              aria-label={`View ${cardLabel(card,data.subjects)}, ${series?.name ?? "unassigned"}`}>
              {image
                ? <span className="crowns-checklist-row__art"><img src={image} alt="" loading="lazy" /></span>
                : <span className="crowns-checklist-row__number">{String(card.source_row ?? i + 1).padStart(3,"0")}</span>}
              <span className="crowns-checklist-row__content">
                <strong>{cardLabel(card,data.subjects)}</strong>
                <small>{[subject?.sport || card.classification, series?.name || "Design unassigned"]
                  .filter(Boolean).join(" · ")}</small>
              </span>
              <span className={`crowns-status crowns-status--${card.status}`}>{humanize(card.status)}</span>
              <span className="crowns-checklist-row__chevron" aria-hidden="true">›</span>
            </button>
            {owner && <Link className="crowns-checklist-row__edit" to={`/crowns/studio?card=${card.id}`} aria-label={`Edit ${cardLabel(card,data.subjects)} in Studio`}>EDIT</Link>}
          </article>
        );
      })}
    </div>
  );
}
