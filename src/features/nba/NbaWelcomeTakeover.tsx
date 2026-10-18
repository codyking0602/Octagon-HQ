import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NBA_POSTER_SRC, NBA_PUBLIC_ENABLED } from "./nbaPreviewAccess";
import "../../styles/nba-welcome.css";

export const NBA_WELCOME_PREVIEW_VERSION = NBA_PUBLIC_ENABLED ? "2026-public-v1" : "2026-review-v1";
export const NBA_WELCOME_REOPEN_EVENT = "octagon-hq:nba-welcome:reopen";
export const nbaWelcomeKey = (profileId: string) =>
  `octagon-hq:nba-welcome:${NBA_WELCOME_PREVIEW_VERSION}:${profileId}`;

export function NbaWelcomeTakeover({ profileId }: { profileId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLaunchLink = new URLSearchParams(location.search).get("hq-reveal") === "basketball-2026";
  const [step, setStep] = useState<"poster" | "explainer" | "closed">(() => {
    try { return isLaunchLink || window.localStorage.getItem(nbaWelcomeKey(profileId)) !== "dismissed" ? "poster" : "closed"; }
    catch { return "poster"; }
  });
  useEffect(() => {
    const reopen = () => setStep("poster");
    window.addEventListener(NBA_WELCOME_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(NBA_WELCOME_REOPEN_EVENT, reopen);
  }, []);
  useEffect(() => {
    if (step === "closed") return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, [step]);
  if (step === "closed") return null;
  const complete = (goToFutures: boolean) => {
    try { window.localStorage.setItem(nbaWelcomeKey(profileId), "dismissed"); } catch { /* session acknowledgement survives */ }
    setStep("closed");
    if (goToFutures) navigate("/nba/picks");
    else if (isLaunchLink) navigate("/", { replace: true });
  };

  return <div className="nba-welcome" role="dialog" aria-modal="true" aria-label="Basketball HQ introduction">
    {step === "poster" ? (
      <div className="nba-welcome__poster">
        <img src={NBA_POSTER_SRC}
          alt="Basketball is in the HQ. NBA players in an arena beneath the NBA emblem."
          draggable={false} />
        <button type="button" className="nba-welcome__continue" onClick={() => setStep("explainer")}>
          <span>CONTINUE</span><b aria-hidden="true">›</b>
        </button>
      </div>
    ) : (
      <div className="nba-welcome__explainer" data-testid="nba-introduction-explainer">
        <div className="nba-welcome__explainer-inner">
          <div className="nba-welcome__eyebrow">THE HQ · 2026–27 NBA SEASON</div>
          <h1>WELCOME TO<br/><em>BASKETBALL HQ</em></h1>
          <p className="nba-welcome__deck">One championship. An entire NBA season.</p>
          <div className="nba-welcome__phase is-current">
            <div><small>01 · AVAILABLE NOW</small><strong>NBA FUTURES</strong><p>30 team win-total Over/Unders, playoff teams, awards, NBA champion, and more. 100 points up for grabs.</p></div>
            <b>15%</b>
          </div>
          <div className="nba-welcome__phase">
            <div><small>02 · DECEMBER</small><strong>NBA CUP PICKS</strong><p>Our first basketball Picks competition, beginning with the Cup knockout rounds.</p></div><b>10%</b>
          </div>
          <div className="nba-welcome__phase">
            <div><small>03 · AFTER THE WORLD SERIES</small><strong>BASKETBALL GAMES</strong><p>New NBA games join the HQ throughout the regular season.</p></div><b>20%</b>
          </div>
          <div className="nba-welcome__phase">
            <div><small>04 · APRIL 2027</small><strong>NBA PLAYOFF PICKS</strong><p>The main championship competition. Follow the postseason through the Finals.</p></div><b>55%</b>
          </div>
          <div className="nba-welcome__actions">
            <button type="button" className="nba-welcome__primary" onClick={() => complete(true)}>OPEN NBA FUTURES <span aria-hidden="true">→</span></button>
            <button type="button" className="nba-welcome__later" onClick={() => complete(false)}>EXPLORE THE HQ LATER</button>
          </div>
          {!NBA_PUBLIC_ENABLED ? <small className="nba-welcome__preview-label">OWNER PREVIEW · NOT PUBLIC</small> : null}
        </div>
      </div>
    )}
  </div>;
}
