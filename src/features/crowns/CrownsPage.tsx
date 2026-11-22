import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useCrownsAccess } from "./CrownsAccess";
import CrownsStudio from "./CrownsStudio";
import {
  type CrownsCard, type CrownsData, type CrownsSeries,
  cardLabel, cardOrientation, humanize, loadCrowns, signedCrownsImages,
} from "./crownsData";
import "../../styles/crowns.css";

const FAMILY_NAMES: Record<string, string> = {
  classic: "CROWNS Classic",
  eclipse: "CROWNS Eclipse",
  nova: "CROWNS Nova",
  independent: "Independent Collections",
};
const FAMILY_COPY: Record<string, string> = {
  classic: "Traditional foundations. Timeless subjects. Signature recognition.",
  eclipse: "Dark, precise, and exceptionally premium.",
  nova: "Graphic energy and bold creative expression.",
  independent: "Distinctive formats that stand outside the three main families.",
};

function CrownSymbol({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="25 42 652 469" fill="currentColor" aria-hidden="true">
    <path d="M161,468 170,495 175,502 350,464 526,502 532,495 540,472 540,467 533,463 354,423 340,424 165,464Z" />
    <path d="M40,173 36,182 36,196 42,210 54,219 76,222 79,226 149,435 156,447 344,411 364,412 547,447 624,224 627,221 641,221 654,216 662,207 666,194 664,177 655,164 642,158 620,160 608,170 604,178 602,190 606,207 461,309 367,112 382,94 383,78 380,68 371,57 357,51 341,52 333,56 321,70 320,93 335,114 241,309 99,210 96,204 100,184 96,173 88,164 76,158 60,158 50,162Z" />
  </svg>;
}

function CardArtwork({
  card, series, urls, face = "front",
}: {
  card: CrownsCard; series: CrownsSeries[]; urls: Record<string, string>; face?: "front" | "back";
}) {
  const path = face === "front" ? card.front_path : card.back_path;
  const src = path ? urls[path] : null;
  return (
    <div className={`crowns-artwork crowns-artwork--${cardOrientation(card, series)}`}>
      {src ? <img src={src} alt={`${face} of ${card.title || "CROWNS card"}`} loading="lazy" /> : (
        <div className="crowns-placeholder">
          <CrownSymbol size={49} />
          <span>{face === "back" ? "BACK NOT UPLOADED" : "DESIGN IN PROGRESS"}</span>
        </div>
      )}
    </div>
  );
}

function CardTile({
  card, data, urls, onOpen,
}: {
  card: CrownsCard; data: CrownsData; urls: Record<string, string>; onOpen: (cardId: number) => void;
}) {
  const series = data.series.find(s => s.slug === card.series_slug);
  return (
    <button type="button" className="crowns-tile" onClick={() => onOpen(card.id)}>
      <CardArtwork card={card} series={data.series} urls={urls} />
      <span className="crowns-tile__info">
        <strong>{cardLabel(card, data.subjects)}</strong>
        <span>{series?.name ?? "Series not assigned"}</span>
        <small className={`crowns-status crowns-status--${card.status}`}>{humanize(card.status)}{card.legacy ? " · LEGACY" : ""}</small>
      </span>
    </button>
  );
}

export default function CrownsPage() {
  const access = useCrownsAccess();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<CrownsData | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [face, setFace] = useState<"front" | "back">("front");
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("all");
  const [status, setStatus] = useState("all");

  const refresh = useCallback(async () => {
    try {
      const next = await loadCrowns();
      setData(next);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the CROWNS catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!data || !access.is_owner) return;
    let live = true;
    void signedCrownsImages(data).then(next => {
      if (live) setUrls(next);
    }).catch(() => { if (live) setUrls({}); });
    return () => { live = false; };
  }, [data, access.is_owner]);

  const page = location.pathname.endsWith("/studio") ? "studio"
    : location.pathname.endsWith("/collections") ? "collections"
    : location.pathname.endsWith("/gallery") ? "gallery"
    : location.pathname.endsWith("/guide") ? "guide" : "home";
  const selectedCard = data?.cards.find(card => card.id === selectedId) ?? null;
  const activeSeries = params.get("series") || "all";
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.cards.filter(card => {
      const subject = data.subjects.find(s => s.id === card.subject_id);
      const series = data.series.find(s => s.slug === card.series_slug);
      const term = search.trim().toLowerCase();
      return (!term || [subject?.name, card.title, card.classification, series?.name]
        .some(value => value?.toLowerCase().includes(term)))
        && (family === "all" || series?.family === family)
        && (status === "all" || card.status === status)
        && (activeSeries === "all" || card.series_slug === activeSeries);
    });
  }, [data, search, family, status, activeSeries]);
  const finished = data?.cards.filter(card => card.status === "finished" || card.status === "printed").length ?? 0;
  const withArtwork = data?.cards.filter(card => card.front_path).length ?? 0;
  const openCard = (id: number) => { setSelectedId(id); setFace("front"); };
  const seriesName = (slug: string | null) => data?.series.find(s => s.slug === slug)?.name ?? "Unassigned";
  const featured = data?.cards.filter(card => card.front_path).slice(-6).reverse() ?? [];

  return (
    <div className="crowns-page">
      <header className="crowns-masthead">
        <Link to="/crowns" className="crowns-masthead__brand">
          <CrownSymbol size={44} />
          <span><strong>CROWNS</strong><small>CARD COMPANY</small></span>
        </Link>
        <div className="crowns-masthead__aside">
          {access.is_owner && <span className="crowns-private-mark">OWNER PREVIEW</span>}
          <Link to="/" className="crowns-back">THE HQ ↗</Link>
        </div>
      </header>

      <nav className="crowns-nav" aria-label="CROWNS sections">
        {([
          ["home", "Home", "/crowns"], ["collections", "Collections", "/crowns/collections"],
          ["gallery", "Gallery", "/crowns/gallery"], ["guide", "Collector's Guide", "/crowns/guide"],
          ...(access.is_owner ? [["studio", "Studio", "/crowns/studio"]] : []),
        ] as string[][]).map(([key, name, path]) =>
          <Link key={key} className={page === key ? "is-current" : ""} to={path!}>{name}</Link>)}
      </nav>

      {loading ? <div className="crowns-message">Loading the collection…</div> : error
        ? <div className="crowns-message" role="alert">{error} <button onClick={() => void refresh()}>Retry</button></div>
        : data && (
          <>
            {page === "home" && (
              <>
                <section className="crowns-hero">
                  <span className="crowns-eyebrow">A PERSONAL COLLECTING UNIVERSE</span>
                  <CrownSymbol size={72} />
                  <h1>Every card has a story.</h1>
                  <p>From timeless legends to imaginative originals. Explore the designs, distinctions, and editions of CROWNS Card Company.</p>
                  <div className="crowns-hero__actions">
                    <Link className="crowns-action" to="/crowns/collections">EXPLORE COLLECTIONS</Link>
                    <Link className="crowns-action crowns-action--secondary" to="/crowns/gallery">VIEW THE CATALOG</Link>
                  </div>
                </section>
                <div className="crowns-stats">
                  <div><strong>{data.cards.length}</strong><span>PLANNED CARD SLOTS</span></div>
                  <div><strong>{data.subjects.length}</strong><span>UNIQUE SUBJECTS</span></div>
                  <div><strong>{finished}</strong><span>FINISHED / PRINTED</span></div>
                  <div><strong>{withArtwork}</strong><span>FRONTS UPLOADED</span></div>
                </div>
                <div className="crowns-section-head"><h2>Explore the universe</h2><Link to="/crowns/collections">ALL COLLECTIONS ↗</Link></div>
                <div className="crowns-family-grid">
                  {Object.entries(FAMILY_NAMES).map(([key, name]) => (
                    <Link to="/crowns/collections" key={key} className={`crowns-family crowns-family--${key}`}>
                      <span>COLLECTION {key === "independent" ? "—" : `0${["classic","eclipse","nova"].indexOf(key)+1}`}</span>
                      <h3>{name}</h3><p>{FAMILY_COPY[key]}</p><strong>DISCOVER ↗</strong>
                    </Link>
                  ))}
                </div>
                <div className="crowns-section-head"><h2>Finished artwork</h2><Link to="/crowns/gallery">BROWSE ALL ↗</Link></div>
                {featured.length ? <div className="crowns-gallery-grid">{featured.map(card => (
                  <CardTile card={card} data={data} urls={urls} onOpen={openCard} key={card.id} />
                ))}</div> : <div className="crowns-empty">Your finished Canva artwork will appear here as you upload it. All planned subjects are already in the catalog.</div>}
              </>
            )}

            {page === "collections" && (
              <>
                <section className="crowns-page-intro"><span className="crowns-eyebrow">THE DESIGN SYSTEM</span><h1>Collections & inserts</h1>
                  <p>Three core card families, two independent collections, and series with their own identities and checklists.</p></section>
                {Object.entries(FAMILY_NAMES).map(([key, name]) => (
                  <section className="crowns-collection-section" key={key}>
                    <div className="crowns-section-head"><div><span className="crowns-eyebrow">{key.toUpperCase()}</span><h2>{name}</h2><p>{FAMILY_COPY[key]}</p></div></div>
                    <div className="crowns-series-grid">
                      {data.series.filter(s => s.family === key && s.active).map(series => (
                        <Link className="crowns-series-card" key={series.slug} to={`/crowns/gallery?series=${series.slug}`}>
                          <span className="crowns-series-card__crest"><CrownSymbol size={35}/></span>
                          <small>{series.series_kind.toUpperCase()} · {series.rarity.toUpperCase()}</small>
                          <h3>{series.name}</h3><p>{series.description || "A distinctive CROWNS series."}</p>
                          <span>{data.cards.filter(c => c.series_slug === series.slug).length} CARDS ASSIGNED <b>EXPLORE ↗</b></span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
                <div className="crowns-note"><strong>LEGACY</strong> is a designation for truly exceptional achievements—not a base family or a regular insert.</div>
              </>
            )}

            {page === "gallery" && (
              <>
                <section className="crowns-page-intro"><span className="crowns-eyebrow">THE COMPLETE CHECKLIST</span><h1>Card Gallery</h1>
                  <p>Discover planned entries, finished artwork, individual cards, and future parallel editions.</p></section>
                <div className="crowns-filters">
                  <input aria-label="Search cards" type="search" placeholder="Search subjects or cards…" value={search} onChange={e => setSearch(e.target.value)} />
                  <select aria-label="Filter family" value={family} onChange={e => setFamily(e.target.value)}>
                    <option value="all">All families</option>{Object.entries(FAMILY_NAMES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  <select aria-label="Filter series" value={activeSeries} onChange={e => setParams(current => { const next=new URLSearchParams(current); if(e.target.value==="all")next.delete("series"); else next.set("series",e.target.value); return next; })}>
                    <option value="all">All series</option>{data.series.map(s=><option value={s.slug} key={s.slug}>{s.name}</option>)}
                  </select>
                  <select aria-label="Filter status" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="all">All statuses</option>{["planned","designing","finished","printed"].map(s=><option key={s} value={s}>{humanize(s)}</option>)}
                  </select>
                </div>
                <div className="crowns-gallery-count">{filtered.length} CARD ENTRIES · {data.cards.filter(c=>!c.series_slug).length} AWAIT SERIES ASSIGNMENT</div>
                <div className="crowns-gallery-grid">
                  {filtered.map(card=><CardTile card={card} data={data} urls={urls} onOpen={openCard} key={card.id} />)}
                </div>
                {!filtered.length && <div className="crowns-empty">No cards match these filters.</div>}
              </>
            )}

            {page === "guide" && (
              <>
                <section className="crowns-page-intro"><span className="crowns-eyebrow">COLLECTOR'S FIELD GUIDE</span><h1>The language of CROWNS</h1>
                  <p>No card knowledge needed. These are the distinctions that give this collection its structure.</p></section>
                <div className="crowns-guide-grid">
                  {[
                    ["01","BASE CARDS","The foundational design of Classic, Eclipse, or Nova. One subject may appear in more than one family."],
                    ["02","INSERTS","A separate design series with its own checklist. Examples include SHOWCASE, LUNAR, and SUPERSONIC."],
                    ["03","PARALLELS","Alternate treatments of an existing card: borders, patterns, colors, or other deliberate differences. They are not new insert designs."],
                    ["04","NUMBERED EDITIONS","An edition marked with a finite print run, such as 1/5 or 2/5. Signature 1/1 indicates a truly unique edition."],
                    ["05","LEGACY","A special emblem reserved for historic accomplishments and legendary achievements. It can accompany a card without changing its family."],
                    ["06","PRODUCTION","Planned means an idea exists; designing means artwork is underway; finished means the digital design is complete; printed tracks a produced physical card."],
                  ].map(([num,title,desc])=><article className="crowns-guide-item" key={num}>
                    <span>{num}</span><h2>{title}</h2><p>{desc}</p></article>)}
                </div>
              </>
            )}

            {page === "studio" && (access.is_owner
              ? <CrownsStudio data={data} refresh={refresh} urls={urls} />
              : <div className="crowns-message">Owner access required.</div>)}
          </>
        )}

      {selectedCard && data && (
        <div className="crowns-modal-backdrop" onMouseDown={e => { if(e.target===e.currentTarget)setSelectedId(null); }}>
          <section className="crowns-modal" role="dialog" aria-modal="true" aria-label={cardLabel(selectedCard,data.subjects)}>
            <button className="crowns-modal__close" type="button" aria-label="Close card details" onClick={()=>setSelectedId(null)}>×</button>
            <div className="crowns-modal__image"><CardArtwork card={selectedCard} series={data.series} urls={urls} face={face}/>
              <div className="crowns-flip"><button type="button" onClick={()=>setFace(face==="front"?"back":"front")}>↻ SHOW {face==="front"?"BACK":"FRONT"}</button></div>
            </div>
            <div className="crowns-modal__copy">
              <span className="crowns-eyebrow">{seriesName(selectedCard.series_slug)}</span>
              <h2>{cardLabel(selectedCard,data.subjects)}</h2>
              <p>{selectedCard.classification ? `${selectedCard.classification} · ` : ""}{humanize(selectedCard.status)}</p>
              {selectedCard.legacy && <div className="crowns-special-pill">LEGACY {selectedCard.legacy_reason ? `— ${selectedCard.legacy_reason}` : ""}</div>}
              <h3>PARALLELS & EDITIONS</h3>
              {data.variants.filter(v=>v.card_id===selectedCard.id).map(v=>(
                <div className="crowns-edition-row" key={v.id}><strong>{v.name}</strong>
                  <span>{v.signature_one_of_one?"1/1":v.serial_limit?`/${v.serial_limit}`:humanize(v.variant_kind)}</span></div>
              ))}
              {!data.variants.some(v=>v.card_id===selectedCard.id) && <p>No parallel editions assigned yet.</p>}
              <h3>COLLECTION NOTES</h3><p>{selectedCard.notes || "Additional card details will be added as the design progresses."}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
