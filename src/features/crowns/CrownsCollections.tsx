import { Link } from "react-router-dom";
import { crownsGalleryUrl, crownsSeriesPreview } from "./crownsCatalog";
import type { CrownsCard, CrownsData, CrownsSeries } from "./crownsData";

export const CROWNS_FAMILIES: Record<string, { label: string; tagline: string; kicker: string }> = {
  classic: { label: "CROWNS Classic", tagline: "Traditional foundations. Distinctive recognition.", kicker: "THE FOUNDATION" },
  eclipse: { label: "CROWNS Eclipse", tagline: "Dark, deliberate, exceptionally rare.", kicker: "THE DARK SIDE" },
  nova: { label: "CROWNS Nova", tagline: "Bold graphic energy. Imagination without limits.", kicker: "THE UNEXPECTED" },
  independent: { label: "Independent Collections", tagline: "One-of-a-kind formats beyond the main families.", kicker: "BEYOND THE FAMILIES" },
};

export function CrownsSeriesVisual({
  series, cards, urls, compact = false,
}: {
  series: CrownsSeries; cards: CrownsCard[]; urls: Record<string, string>; compact?: boolean;
}) {
  const card = crownsSeriesPreview(cards, series.slug);
  const photo = card?.front_path ? urls[card.front_path] : null;
  return (
    <div className={`crowns-series-visual crowns-series-visual--${series.slug}${compact ? " crowns-series-visual--compact" : ""}`}
      aria-label={photo ? `${series.name} card artwork` : `${series.name} series artwork preview pending`}>
      {photo ? <img src={photo} alt={`Finished ${series.name} card example`} loading="lazy" /> : (
        <>
          <div className="crowns-series-visual__geometry" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="crowns-series-visual__type">
            <small>{series.family === "independent" ? "CROWNS COLLECTION" : `CROWNS ${series.family.toUpperCase()}`}</small>
            <strong>{series.name.replace(" Base", "")}</strong>
            <span>{series.series_kind === "base" ? "BASE SERIES" : series.series_kind === "collection" ? "COLLECTION" : "SIGNATURE INSERT"}</span>
          </div>
          <span className="crowns-series-visual__pending">DESIGN PREVIEW · ARTWORK TO COME</span>
        </>
      )}
    </div>
  );
}

export function CrownsFamilyPortal({
  id, data, compact = false,
}: { id: string; data: CrownsData; compact?: boolean }) {
  const info = CROWNS_FAMILIES[id];
  if (!info) return null;
  const familySeries = data.series.filter(s => s.family === id && s.active);
  const heroSeries = familySeries[0];
  return (
    <Link to={`/crowns/family/${id}`} className={`crowns-family-portal crowns-family-portal--${id}${compact ? " crowns-family-portal--compact" : ""}`}>
      <div className="crowns-family-portal__visual" aria-hidden="true">
        <span>{id === "independent" ? "CROWNS / STUDIO" : "CROWNS / SERIES"}</span>
        <strong>{id === "independent" ? "01 / 02" : id.toUpperCase()}</strong>
        <i />
      </div>
      <div className="crowns-family-portal__copy">
        <span className="crowns-eyebrow">{info.kicker}</span>
        <h3>{info.label}</h3>
        {!compact && <p>{info.tagline}</p>}
        <span className="crowns-family-portal__foot">
          {familySeries.length} DESIGNS{heroSeries ? ` · ${heroSeries.series_kind === "base" ? "BASE + INSERTS" : "COLLECTIONS"}` : ""}
          <b>EXPLORE ↗</b>
        </span>
      </div>
    </Link>
  );
}

export function CrownsCollectionDirectory({ data }: { data: CrownsData }) {
  return (
    <>
      <section className="crowns-page-intro crowns-page-intro--compact">
        <span className="crowns-eyebrow">THE CROWNS UNIVERSE</span>
        <h1>Collections</h1>
        <p>Choose a family to explore its base design, signature inserts, and rare chase series.</p>
      </section>
      <div className="crowns-family-directory">
        {Object.keys(CROWNS_FAMILIES).map(id => <CrownsFamilyPortal key={id} id={id} data={data} />)}
      </div>
      <p className="crowns-directory-note">
        <strong>LEGACY</strong> is a special designation for historic achievements, not another insert or family.
        <Link to="/crowns/guide"> HOW CROWNS WORKS ↗</Link>
      </p>
    </>
  );
}

export function CrownsFamilyDetail({
  family, data, urls,
}: {
  family: string; data: CrownsData; urls: Record<string, string>;
}) {
  const info = CROWNS_FAMILIES[family];
  if (!info) return <div className="crowns-empty">Family not found. <Link to="/crowns/collections">Back to collections ↗</Link></div>;
  const series = data.series.filter(s => s.family === family && s.active);
  const assigned = data.cards.filter(c => series.some(s => s.slug === c.series_slug)).length;
  return (
    <>
      <section className={`crowns-family-heading crowns-family-heading--${family}`}>
        <Link className="crowns-breadcrumb" to="/crowns/collections">‹ ALL COLLECTIONS</Link>
        <span className="crowns-eyebrow">{info.kicker}</span>
        <h1>{info.label}</h1>
        <p>{info.tagline}</p>
        <div className="crowns-family-heading__stats"><span><strong>{series.length}</strong> DESIGNS</span><span><strong>{assigned}</strong> CARDS ASSIGNED</span></div>
      </section>
      <div className="crowns-section-head crowns-section-head--tight">
        <h2>{family === "independent" ? "The collections" : "Base & inserts"}</h2>
      </div>
      <div className="crowns-family-series-list">
        {series.map(s => {
          const count = data.cards.filter(c => c.series_slug === s.slug).length;
          return (
            <Link to={`/crowns/series/${s.slug}`} className="crowns-family-series" key={s.slug}>
              <CrownsSeriesVisual series={s} cards={data.cards} urls={urls} />
              <div className="crowns-family-series__detail">
                <span className="crowns-eyebrow">{s.series_kind.toUpperCase()} · {s.rarity.toUpperCase()}</span>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <span className="crowns-family-series__footer">
                  {count ? `${count} CARDS ASSIGNED` : "CHECKLIST OPEN FOR ASSIGNMENTS"} <b>VIEW DESIGN ↗</b>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {family !== "independent" && <div className="crowns-detail-actions">
        <Link to={crownsGalleryUrl()} className="crowns-link-subtle">BROWSE COMPLETE CARD CHECKLIST ↗</Link>
      </div>}
    </>
  );
}

export function CrownsSeriesDetail({
  slug, data, urls, owner,
}: { slug: string; data: CrownsData; urls: Record<string, string>; owner: boolean }) {
  const series = data.series.find(s => s.slug === slug);
  if (!series) return <div className="crowns-empty">Design not found. <Link to="/crowns/collections">Back to collections ↗</Link></div>;
  const assigned = data.cards.filter(c => c.series_slug === slug);
  const completed = assigned.filter(c => c.front_path);
  return (
    <>
      <section className="crowns-series-heading">
        <Link className="crowns-breadcrumb" to={`/crowns/family/${series.family}`}>‹ {CROWNS_FAMILIES[series.family]?.label ?? "COLLECTIONS"}</Link>
        <span className="crowns-eyebrow">{series.series_kind.toUpperCase()} · {series.rarity.toUpperCase()}</span>
        <h1>{series.name}</h1>
        <p>{series.description || "An original CROWNS design series."}</p>
      </section>
      <div className="crowns-design-profile">
        <CrownsSeriesVisual series={series} cards={data.cards} urls={urls} />
        <div className="crowns-design-profile__copy">
          <span className="crowns-eyebrow">SERIES PROFILE</span>
          <h2>{series.name}</h2>
          <p>Part of {CROWNS_FAMILIES[series.family]?.label ?? "CROWNS"}. {series.orientation === "landscape" ? "Designed in landscape orientation." : "Designed in portrait orientation."}</p>
          <div className="crowns-design-facts">
            <span>TYPE <strong>{series.series_kind.toUpperCase()}</strong></span>
            <span>RARITY <strong>{series.rarity.toUpperCase()}</strong></span>
            <span>ASSIGNED <strong>{assigned.length}</strong></span>
          </div>
          <Link className="crowns-action crowns-action--outline" to={crownsGalleryUrl(slug)}>VIEW SERIES CHECKLIST ↗</Link>
        </div>
      </div>
      <section className="crowns-series-bottom">
        <div className="crowns-section-head crowns-section-head--tight"><h2>Series gallery</h2></div>
        {completed.length > 0 ? (
          <div className="crowns-series-thumbnails">
            {completed.map(c => c.front_path && urls[c.front_path] ? (
              <Link key={c.id} to={crownsGalleryUrl(slug)} aria-label="Open series checklist">
                <img src={urls[c.front_path]} alt={data.subjects.find(s=>s.id===c.subject_id)?.name ?? "Finished CROWNS card"} loading="lazy" />
              </Link>
            ) : null)}
          </div>
        ) : (
          <div className="crowns-compact-empty">
            <strong>The design is ready for its first card.</strong>
            <p>Finished Canva art will appear here once uploaded. No artwork is being represented as completed.</p>
            {owner && <Link to="/crowns/studio">ASSIGN A CARD IN STUDIO ↗</Link>}
          </div>
        )}
      </section>
    </>
  );
}
