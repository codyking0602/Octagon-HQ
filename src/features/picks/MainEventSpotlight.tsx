import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fighterThumbnailPath } from "./FighterThumbnail";
import {
  ShaneContenderBadge,
  ShaneContenderSpotlightSection,
  shaneContendersForBout,
} from "./ShaneContenderSpotlight";
import type { PickBout, PickEventSpotlight } from "./picksModel";

const fighterPhotoModules = import.meta.glob<{ default: string }>(
  "/public/assets/fighters/*.{webp,png,jpg,jpeg}",
  { eager: true, query: "?url" },
);

const spotlightPhotoSlugAliases = new Map([
  ["ian-garry", "ian-machado-garry"],
]);

const spotlightPhotoBySlug = new Map(
  Object.entries(fighterPhotoModules)
    .filter(([path]) => /-spotlight\.(webp|png|jpe?g)$/i.test(path))
    .map(([path]) => {
      const filename = path.split("/").at(-1) ?? "";
      const assetSlug = filename
        .replace(/\.(webp|png|jpe?g)$/i, "")
        .replace(/-spotlight$/i, "");
      const slug = spotlightPhotoSlugAliases.get(assetSlug) ?? assetSlug;
      return [slug, path.replace(/^\/public/, "")] as const;
    }),
);

const profilePhotoBySlug = new Map(
  Object.entries(fighterPhotoModules)
    .filter(([path]) => !/-(?:thumb|spotlight)\.(webp|png|jpe?g)$/i.test(path))
    .map(([path]) => {
      const filename = path.split("/").at(-1) ?? "";
      const slug = filename
        .replace(/\.(webp|png|jpe?g)$/i, "")
        .replace(/-profile$/i, "");
      return [slug, path.replace(/^\/public/, "")] as const;
    }),
);

interface SpotlightFighter {
  slug: string;
  name: string;
  record?: string;
  age?: string;
  height?: string;
  reach?: string;
  stance?: string;
  edges: string[];
}

interface SpotlightWatch {
  label: string;
  url: string;
}

interface SpotlightData {
  kicker: string;
  preview?: string;
  red: SpotlightFighter;
  blue: SpotlightFighter;
  watchSpotlights: SpotlightWatch[];
}

const medicRodriguezSpotlight: SpotlightData = {
  kicker: "MAIN EVENT · 5 ROUNDS · WELTERWEIGHT",
  preview: "A hometown finisher on a three-fight first-round knockout streak meets a veteran volume boxer on a three-fight win streak. Medić brings speed, southpaw power, and early chaos; Rodriguez brings reach, combinations, and the composure to make the fight long.",
  red: {
    slug: "uros-medic",
    name: "Uroš Medić",
    record: "7-3 UFC",
    age: "33",
    height: "6'1\"",
    reach: "71\"",
    stance: "Southpaw",
    edges: ["First-round finishing danger", "Speed and explosive entries", "Youth and hometown momentum"],
  },
  blue: {
    slug: "daniel-rodriguez",
    name: "Daniel Rodriguez",
    record: "10-4 UFC",
    age: "39",
    height: "6'1\"",
    reach: "74\"",
    stance: "Southpaw",
    edges: ["Volume boxing", "Reach and pocket combinations", "Veteran composure"],
  },
  watchSpotlights: [{
    label: "WATCH SPOTLIGHT ↗",
    url: "https://youtu.be/IBzzsI7TrDc?is=q7Q8ZfSD8TobYbjl",
  }],
};

const gamrotSalkilldSpotlight: SpotlightData = {
  kicker: "MAIN EVENT · 5 ROUNDS · LIGHTWEIGHT",
  preview: "A proven top-10 pressure wrestler meets the division's fastest-rising finisher. Gamrot can turn every exchange into a chain-wrestling and scramble test; Salkilld brings length, explosive finishing power, and the takedown defense to keep the fight dangerous everywhere.",
  red: {
    slug: "mateusz-gamrot",
    name: "Mateusz Gamrot",
    record: "9-4 UFC",
    age: "35",
    height: "5'10\"",
    reach: "70.5\"",
    stance: "Southpaw",
    edges: ["Chain wrestling and mat returns", "Scramble pace and endurance", "Five-round top-10 experience"],
  },
  blue: {
    slug: "quillan-salkilld",
    name: "Quillan Salkilld",
    record: "5-0 UFC",
    age: "26",
    height: "6'0\"",
    reach: "75\"",
    stance: "Orthodox",
    edges: ["First-round finishing threat", "Length and explosive speed", "Youth and unbeaten UFC momentum"],
  },
  watchSpotlights: [{
    label: "GAMROT SPOTLIGHT ↗",
    url: "https://youtu.be/a6B2uVbD10U?si=9V8KK6f6uNN65g-L",
  }, {
    label: "SALKILLD SPOTLIGHT ↗",
    url: "https://youtu.be/Kjq4Jz1XuiI?si=QJdJ5ozZpi-oUy4l",
  }],
};

const bilalRojasSpotlight: SpotlightData = {
  kicker: "FIGHT SPOTLIGHT · FLYWEIGHT",
  preview: "Two unbeaten 9–0 flyweight finishers hit Shanghai with no meaningful UFC sample to lean on. Hasan arrives 18 days after a 45-second Contender Series contract win, carrying the speed, creativity, and finishing instinct that put him #5 on Shane’s board. Rojas is 9–0 with seven KO/TKO wins and comes in off a July 22 decision. The swing factor is whose finishing danger translates first: Hasan’s explosive prospect upside or Rojas’ proven knockout threat.",
  red: {
    slug: "bilal-hasan",
    name: "Bilal Hasan",
    record: "9-0",
    edges: ["8 finishes in 9 pro wins", "45-second Contender Series contract win", "Shane’s #5 prospect"],
  },
  blue: {
    slug: "nilson-rojas",
    name: "Nilson Rojas",
    record: "9-0",
    edges: ["7 KO/TKO wins in 9 fights", "Unbeaten professional record", "Won again on July 22"],
  },
  watchSpotlights: [],
};

function staticSpotlightForBout(bout: PickBout): SpotlightData | null {
  const slugs = new Set([bout.redFighterSlug, bout.blueFighterSlug]);
  if (slugs.has("bilal-hasan") && slugs.has("nilson-rojas")) return bilalRojasSpotlight;
  if (slugs.has("mateusz-gamrot") && slugs.has("quillan-salkilld")) return gamrotSalkilldSpotlight;
  if (slugs.has("uros-medic") && slugs.has("daniel-rodriguez")) return medicRodriguezSpotlight;
  return null;
}

function fighterDisplayName(bout: PickBout, slug: string) {
  if (slug === bout.redFighterSlug) return bout.redFighterName;
  if (slug === bout.blueFighterSlug) return bout.blueFighterName;
  return slug;
}

function configuredWatches(bout: PickBout, spotlight: PickEventSpotlight): SpotlightWatch[] {
  return spotlight.watchSpotlights.map((watch) => {
    const name = fighterDisplayName(bout, watch.fighterSlug);
    const shortName = name.trim().split(/\s+/).at(-1)?.toUpperCase() || name.toUpperCase();
    return { label: `${shortName} SPOTLIGHT ↗`, url: watch.url };
  });
}

function configuredSpotlightForBout(bout: PickBout, spotlight: PickEventSpotlight): SpotlightData | null {
  if (spotlight.boutId !== bout.boutId) return null;
  if (spotlight.red.fighterSlug !== bout.redFighterSlug || spotlight.blue.fighterSlug !== bout.blueFighterSlug) return null;
  const kicker = bout.position === 1
    ? `MAIN EVENT · 5 ROUNDS · ${bout.weightClass.toUpperCase()}`
    : `FIGHT SPOTLIGHT · ${bout.weightClass.toUpperCase()}`;
  return {
    kicker,
    preview: spotlight.preview,
    red: {
      slug: bout.redFighterSlug,
      name: bout.redFighterName,
      record: spotlight.red.record,
      age: spotlight.red.age,
      height: spotlight.red.height,
      reach: spotlight.red.reach,
      stance: spotlight.red.stance,
      edges: spotlight.red.edges,
    },
    blue: {
      slug: bout.blueFighterSlug,
      name: bout.blueFighterName,
      record: spotlight.blue.record,
      age: spotlight.blue.age,
      height: spotlight.blue.height,
      reach: spotlight.blue.reach,
      stance: spotlight.blue.stance,
      edges: spotlight.blue.edges,
    },
    watchSpotlights: configuredWatches(bout, spotlight),
  };
}

function spotlightForBout(bout: PickBout, configured?: PickEventSpotlight | null): SpotlightData | null {
  if (configured) {
    const generated = configuredSpotlightForBout(bout, configured);
    if (generated) return generated;
  }
  return staticSpotlightForBout(bout);
}

function fighterPhotoPath(slug: string) {
  return spotlightPhotoBySlug.get(slug)
    ?? profilePhotoBySlug.get(slug)
    ?? fighterThumbnailPath(slug);
}

function SpotlightPhoto({ fighter }: { fighter: SpotlightFighter }) {
  const [failed, setFailed] = useState(false);
  const source = fighterPhotoPath(fighter.slug);
  const initials = fighter.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  if (!source || failed) {
    return <span className="main-event-spotlight__photo-fallback" aria-hidden="true">{initials}</span>;
  }

  return (
    <img
      src={source}
      alt={fighter.name}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function FighterHero({ fighter, corner }: { fighter: SpotlightFighter; corner: "red" | "blue" }) {
  return (
    <div className={`main-event-spotlight__fighter is-${corner}`}>
      <div className="main-event-spotlight__photo"><SpotlightPhoto fighter={fighter} /></div>
      <div className="main-event-spotlight__fighter-copy">
        <h3>{fighter.name}</h3>
        {fighter.record ? <span>{fighter.record}</span> : null}
      </div>
    </div>
  );
}

function TaleRow({ label, red, blue }: { label: string; red: string; blue: string }) {
  return (
    <div className="main-event-spotlight__tale-row">
      <strong>{red}</strong>
      <span>{label}</span>
      <strong>{blue}</strong>
    </div>
  );
}

function EdgeColumn({ fighter, corner }: { fighter: SpotlightFighter; corner: "red" | "blue" }) {
  return (
    <div className={`main-event-spotlight__edge-column is-${corner}`}>
      <strong>{fighter.name}</strong>
      <div>{fighter.edges.map((edge) => <span key={edge}>{edge}</span>)}</div>
    </div>
  );
}

export function MainEventSpotlight({ bout, spotlight }: { bout: PickBout; spotlight?: PickEventSpotlight | null }) {
  const data = spotlightForBout(bout, spotlight);
  const shaneContenders = shaneContendersForBout(bout);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasTale = Boolean(
    data?.red.record && data.red.age && data.red.height && data.red.reach && data.red.stance
    && data.blue.record && data.blue.age && data.blue.height && data.blue.reach && data.blue.stance,
  );
  const hasEdges = Boolean(data?.red.edges.length || data?.blue.edges.length);
  const hasScouting = shaneContenders.length > 0;
  const triggerCopy = data
    ? (hasScouting ? "View matchup & scouting" : "View matchup breakdown")
    : "View Shane’s scouting report";

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add("main-event-spotlight-open");
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("main-event-spotlight-open");
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  if (!data && !hasScouting) return null;

  return (
    <>
      <button
        className="main-event-spotlight-trigger"
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(true)}
      >
        <span>
          <b>{data ? (bout.position === 1 ? "MAIN EVENT SPOTLIGHT" : "FIGHT SPOTLIGHT") : "SHANE’S CONTENDER SERIES"}</b>
          <strong>{triggerCopy}</strong>
          <ShaneContenderBadge fighters={shaneContenders} />
        </span>
        <i aria-hidden="true">›</i>
      </button>

      {open ? createPortal(
        <div className="main-event-spotlight-modal" role="presentation">
          <button
            className="main-event-spotlight__backdrop"
            type="button"
            aria-label="Close fight spotlight"
            onClick={() => setOpen(false)}
          />
          <section
            className="main-event-spotlight__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={data ? titleId : undefined}
            aria-label={!data ? `${shaneContenders[0]?.name ?? "Shane contender"} scouting report` : undefined}
          >
            <button
              className="main-event-spotlight__close"
              type="button"
              ref={closeRef}
              aria-label="Close fight spotlight"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            {data ? (
              <div className="main-event-spotlight__hero">
                <p>{data.kicker}</p>
                <div className="main-event-spotlight__fighters">
                  <FighterHero fighter={data.red} corner="red" />
                  <div className="main-event-spotlight__vs">VS</div>
                  <FighterHero fighter={data.blue} corner="blue" />
                </div>
              </div>
            ) : null}

            <div className="main-event-spotlight__body">
              {data ? (
                <section className="main-event-spotlight__preview">
                  <span>FIGHT PREVIEW</span>
                  <h2 id={titleId}>{data.red.name} vs. {data.blue.name}</h2>
                  {data.preview ? <p>{data.preview}</p> : null}
                  {data.watchSpotlights.length ? (
                    <div
                      className="main-event-spotlight__watch-links"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${data.watchSpotlights.length}, minmax(0, 1fr))`,
                        gap: "8px",
                      }}
                    >
                      {data.watchSpotlights.map((watch) => (
                        <a key={`${watch.label}:${watch.url}`} href={watch.url} target="_blank" rel="noopener noreferrer">
                          {watch.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              <ShaneContenderSpotlightSection fighters={shaneContenders} />

              {data && hasTale ? (
                <section className="main-event-spotlight__section">
                  <div className="main-event-spotlight__section-title"><span>TALE OF THE TAPE</span></div>
                  <div className="main-event-spotlight__tale">
                    <TaleRow label="Record" red={data.red.record!} blue={data.blue.record!} />
                    <TaleRow label="Age" red={data.red.age!} blue={data.blue.age!} />
                    <TaleRow label="Height" red={data.red.height!} blue={data.blue.height!} />
                    <TaleRow label="Reach" red={data.red.reach!} blue={data.blue.reach!} />
                    <TaleRow label="Stance" red={data.red.stance!} blue={data.blue.stance!} />
                  </div>
                </section>
              ) : null}

              {data && hasEdges ? (
                <section className="main-event-spotlight__section">
                  <div className="main-event-spotlight__section-title"><span>MATCHUP EDGES</span></div>
                  <div className="main-event-spotlight__edges">
                    <EdgeColumn fighter={data.red} corner="red" />
                    <div className="main-event-spotlight__edge-divider" />
                    <EdgeColumn fighter={data.blue} corner="blue" />
                  </div>
                </section>
              ) : null}
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
