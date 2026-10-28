import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { FighterThumbnail } from "./FighterThumbnail";
import { approvedUfcPicksHeadshot } from "./officialUfcPicksHeadshots";
import { shaneContenderForSlug } from "./ShaneContenderSpotlight";
import { getFighter } from "../rankings/rankingModel";

interface Props {
  eventId:string;
  corner:"red"|"blue";
  name:string;
  slug:string;
  odds:string;
  selected:boolean;
  disabled:boolean;
  favorite:boolean;
  statusLabel:string|null;
  nameStyle?:CSSProperties;
  onPick:()=>void;
}

/** The pick is a separate button under independent profile links: never nested clickable controls. */
export function FighterPickChoice({eventId,corner,name,slug,odds,selected,disabled,favorite,statusLabel,nameStyle,onPick}:Props) {
  const hq=getFighter(slug);
  const skcs=shaneContenderForSlug(slug);
  return (
    <div className={["pick-choice",`is-${corner}`,selected?"is-selected":"",disabled?"is-read-only":""].filter(Boolean).join(" ")}>
      <button type="button" className="pick-choice__tap" aria-label={`Pick ${name}`}
        aria-pressed={selected} disabled={disabled} onClick={onPick} />
      <FighterThumbnail name={name} slug={slug} officialHeadshot={approvedUfcPicksHeadshot(eventId,slug)} />
      <span className="pick-choice__name" style={nameStyle}>{name}{selected?<b className="pick-choice__check" aria-label="Your pick">✓</b>:null}</span>
      <small className="pick-choice__odds">{odds}{favorite?" · FAVORITE":""}</small>
      {statusLabel?<em className="pick-choice__status">{statusLabel}</em>:null}
      {hq||skcs?<div className="pick-choice__identity-badges">
        {hq?<Link className="pick-choice__identity-badge is-hq" to={`/fighters/${hq.slug}`}
          aria-label={`Open ${name} HQ ranking profile, rank ${hq.rank}`}>HQ #{hq.rank}</Link>:null}
        {skcs?<Link className="pick-choice__identity-badge is-skcs" to={`/fighters-to-watch#${skcs.id}`}
          aria-label={`Open ${name} SKCS scouting profile, rank ${skcs.rank}`}>SKCS #{skcs.rank}</Link>:null}
      </div>:null}
    </div>
  );
}
