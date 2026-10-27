import { nbaHigherLowerPortraitCredit } from "./nbaHigherLowerPortraits";

/** Attribution stays with the displayed player whenever a CC-licensed
 * historical editorial image is used outside Higher or Lower. */
export function NbaPortraitCredits({ names }: { names: readonly string[] }) {
  const credits = [...new Map(names.flatMap(name => {
    const credit = nbaHigherLowerPortraitCredit({ name });
    return credit ? [[credit.name, credit] as const] : [];
  })).values()];
  if (!credits.length) return null;
  return <details className="nba-shared-photo-credits">
    <summary>Historical photo credits</summary>
    <ul>{credits.map(credit => <li key={credit.name}>
      {credit.name}: {credit.author} · {credit.license} ·
      <a href={credit.source} target="_blank" rel="noopener noreferrer">image source</a>
      {credit.licenseUrl && <> · <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">license</a></>}
    </li>)}</ul>
  </details>;
}
