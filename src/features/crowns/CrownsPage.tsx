import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useCrownsAccess } from "./CrownsAccess";
import CrownsStudio from "./CrownsStudio";
import { CrownsChecklist } from "./CrownsChecklist";
import {
  CROWNS_FAMILIES, CrownsCollectionDirectory, CrownsFamilyDetail,
  CrownsFamilyPortal, CrownsSeriesDetail,
} from "./CrownsCollections";
import { crownsRoute, filterCrownsCatalog } from "./crownsCatalog";
import {
  type CrownsCard, type CrownsData, type CrownsSeries,
  cardLabel, cardOrientation, humanize, loadCrowns, signedCrownsImages,
} from "./crownsData";
import "../../styles/crowns.css";

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
  const [galleryMode, setGalleryMode] = useState<"checklist" | "artwork">("checklist");

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

  const route = crownsRoute(location.pathname);
  const page = route.page;
  const selectedCard = data?.cards.find(card => card.id === selectedId) ?? null;
  const activeSeries = params.get("series") || "all";
  const filtered = useMemo(
    () => data ? filterCrownsCatalog(data.cards, data.subjects, data.series, {
      search, family, status, series: activeSeries,
    }) : [],
    [data, search, family, status, activeSeries],
  );
  const filteredArtwork = filtered.filter(card => card.front_path);
  const anyGalleryFilters = Boolean(search.trim()) || family !== "all" || status !== "all" || activeSeries !== "all";
  const clearGalleryFilters = () => {
    setSearch(""); setFamily("all"); setStatus("all"); setParams({});
  };
  const finished = data?.cards.filter(card => card.status === "finished" || card.status === "printed").length ?? 0;
  const withArtwork = data?.cards.filter(card => card.front_path).length ?? 0;
  const openCard = (id: number) => { setSelectedId(id); setFace("front"); };
  const seriesName = (slug: string | null) => data?.series.find(s => s.slug === slug)?.name ?? "Unassigned";
  const featured = data?.cards.filter(card => card.front_path).slice(-6).reverse() ?? [];
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

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
          <Link key={key} className={page === key || ((page === "family" || page === "series") && key === "collections") ? "is-current" : ""} to={path!}>{name}</Link>)}
      </nav>

      {loading ? <div className="crowns-message">Loading the collection…</div> : error
        ? <div className="crowns-message" role="alert">{error} <button onClick={() => void refresh()}>Retry</button></div>
        : data && (
          <>
            {page === "home" && (
              <>
                <section className="crowns-hero">
                  <span className="crowns-eyebrow">THE CROWNS CARD COMPANY COLLECTION</span>
                  <CrownSymbol size={72} />
                  <h1>Every card has a story.</h1>
                  <p>Three families. Original designs. One collection built card by card.</p>
                  <div className="crowns-hero__actions">
                    <Link className="crowns-action" to="/crowns/collections">EXPLORE COLLECTIONS</Link>
                    <Link className="crowns-action crowns-action--secondary" to="/crowns/gallery">BROWSE THE CHECKLIST</Link>
                  </div>
                </section>
                <div className="crowns-stats">
                  <div><strong>{data.cards.length}</strong><span>PLANNED SLOTS</span></div>
                  <div><strong>{data.subjects.length}</strong><span>SUBJECTS</span></div>
                  <div><strong>{finished}</strong><span>FINISHED</span></div>
                  <div><strong>{withArtwork}</strong><span>ARTWORK</span></div>
                </div>
                <div className="crowns-section-head"><h2>Explore the universe</h2><Link to="/crowns/collections">ALL COLLECTIONS ↗</Link></div>
                <div className="crowns-family-directory crowns-family-directory--home">
                  {Object.keys(CROWNS_FAMILIES).map(key => (
                    <CrownsFamilyPortal key={key} id={key} data={data} compact />
                  ))}
                </div>
                <div className="crowns-section-head"><h2>Finished artwork</h2><Link to="/crowns/gallery">BROWSE ALL ↗</Link></div>
                {featured.length ? <div className="crowns-gallery-grid">{featured.map(card => (
                  <CardTile card={card} data={data} urls={urls} onOpen={openCard} key={card.id} />
                ))}</div> : (
                  <div className="crowns-compact-empty">
                    <strong>The canvas is ready.</strong>
                    <p>Your finished Canva cards will take this spotlight as soon as you upload the first front.</p>
                    {access.is_owner && <Link to="/crowns/studio">OPEN CROWNS STUDIO ↗</Link>}
                  </div>
                )}
              </>
            )}

            {page === "collections" && <CrownsCollectionDirectory data={data} />}
            {page === "family" && route.slug && (
              <CrownsFamilyDetail family={route.slug} data={data} urls={urls} />
            )}
            {page === "series" && route.slug && (
              <CrownsSeriesDetail slug={route.slug} data={data} urls={urls} owner={access.is_owner} />
            )}

            {page === "gallery" && (
              <>
                <section className="crowns-page-intro crowns-page-intro--compact">
                  <span className="crowns-eyebrow">THE MASTER CHECKLIST</span><h1>Card Gallery</h1>
                  <p>All planned subjects, future designs and completed cards. Every entry stays visible until you choose where it belongs.</p>
                </section>
                <div className="crowns-gallery-summary">
                  <div><strong>{data.cards.length}</strong><span>TOTAL ENTRIES</span></div>
                  <div><strong>{data.cards.filter(c => c.series_slug === null).length}</strong><span>UNASSIGNED</span></div>
                  <div><strong>{data.cards.filter(c => c.front_path).length}</strong><span>WITH ARTWORK</span></div>
                </div>
                <div className="crowns-filters">
                  <input aria-label="Search cards" type="search" placeholder="Search subjects, sports, designs…" value={search} onChange={e => setSearch(e.target.value)} />
                  <select aria-label="Filter family" value={family} onChange={e => { setFamily(e.target.value); setParams({}); }}>
                    <option value="all">All families</option>{Object.entries(CROWNS_FAMILIES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select aria-label="Filter series" value={activeSeries} onChange={e => setParams(current => {
                    const next = new URLSearchParams(current);
                    if (e.target.value === "all") next.delete("series"); else next.set("series", e.target.value);
                    return next;
                  })}>
                    <option value="all">All series & unassigned</option>
                    <option value="unassigned">Unassigned plans</option>
                    {data.series.filter(s => family === "all" || s.family === family)
                      .map(s=><option value={s.slug} key={s.slug}>{s.name}</option>)}
                  </select>
                  <select aria-label="Filter status" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="all">All statuses</option>{["planned","designing","finished","printed"].map(s=><option key={s} value={s}>{humanize(s)}</option>)}
                  </select>
                </div>
                <div className="crowns-gallery-toolbar">
                  <span><strong>{filtered.length}</strong> MATCHING CARDS</span>
                  <div className="crowns-gallery-modes" aria-label="Gallery display mode">
                    <button type="button" className={galleryMode==="checklist"?"is-current":""}
                      aria-pressed={galleryMode==="checklist"} onClick={()=>setGalleryMode("checklist")}>CHECKLIST</button>
                    <button type="button" className={galleryMode==="artwork"?"is-current":""}
                      aria-pressed={galleryMode==="artwork"} onClick={()=>setGalleryMode("artwork")}>ARTWORK ({filteredArtwork.length})</button>
                  </div>
                </div>
                {galleryMode === "checklist" && filtered.length > 0 &&
                  <CrownsChecklist cards={filtered} data={data} urls={urls} owner={access.is_owner} onOpen={openCard} />}
                {galleryMode === "artwork" && filteredArtwork.length > 0 &&
                  <div className="crowns-gallery-grid">{filteredArtwork.map(card =>
                    <CardTile card={card} data={data} urls={urls} onOpen={openCard} key={card.id}/>)}</div>}
                {(galleryMode === "artwork" ? filteredArtwork.length === 0 : filtered.length === 0) && (
                  <div className="crowns-compact-empty">
                    <strong>{galleryMode === "artwork" ? "No artwork uploaded for this selection yet." :
                      activeSeries !== "all" && activeSeries !== "unassigned" ? "No cards assigned to this series yet." :
                      "No cards match those filters."}</strong>
                    <p>{galleryMode === "artwork" ? "Switch to Checklist to see planned entries. Artwork will appear after Canva uploads." :
                      "The 188 original planning slots are preserved in the full catalog."}</p>
                    <button type="button" onClick={()=>{clearGalleryFilters();setGalleryMode("checklist");}}>SHOW ALL PLANNED CARDS ↗</button>
                  </div>
                )}
                {anyGalleryFilters && filtered.length > 0 && (
                  <div className="crowns-gallery-clear">
                    <button type="button" onClick={clearGalleryFilters}>CLEAR FILTERS · VIEW ALL {data.cards.length} ENTRIES</button>
                  </div>
                )}
              </>
            )}

            {page === "guide" && (
              <>
                <section className="crowns-page-intro crowns-page-intro--compact">
                  <span className="crowns-eyebrow">COLLECTOR'S FIELD GUIDE</span><h1>Understanding CROWNS</h1>
                  <p>Six quick definitions. Tap a topic for more detail.</p>
                </section>
                <div className="crowns-guide-accordion">
                  {[
                    ["01","BASE CARDS","Each of the three main families has a foundational design. One subject may appear in Classic, Eclipse, Nova, or multiple families."],
                    ["02","INSERTS","A distinct named design with its own checklist, such as SHOWCASE, LUNAR, or SUPERSONIC. An insert is not a parallel."],
                    ["03","PARALLELS","An alternate treatment of the same card, like a special border, team-color match, jersey-number match, or pattern change."],
                    ["04","NUMBERED EDITIONS","Limited copies use serials such as 1/5 or 2/5. A signature 1/1 is a genuinely unique card edition."],
                    ["05","LEGACY","A special emblem recognizing truly historic achievements. Not a fourth family or another insert."],
                    ["06","PRODUCTION","Planned → designing → finished (digital art) → printed. Physical copies and their serial numbers are tracked separately."],
                  ].map(([num,title,desc], index) =>
                    <details className="crowns-guide-item" key={num} open={index===0 ? true : undefined}>
                      <summary><span>{num}</span><strong>{title}</strong><b aria-hidden="true">+</b></summary>
                      <p>{desc}</p>
                    </details>)}
                </div>
                <div className="crowns-guide-footer"><Link to="/crowns/collections">EXPLORE THE COLLECTIONS ↗</Link></div>
              </>
            )}

            {page === "studio" && (access.is_owner
              ? <CrownsStudio data={data} refresh={refresh} urls={urls} initialCardId={Number(params.get("card") || 0)} />
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
