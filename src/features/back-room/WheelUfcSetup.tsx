import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import { createWheelUfcRepository } from "../play/wheelUfcRepository";
import {
  WHEEL_UFC_CATEGORY_KEYS,
  WHEEL_UFC_CATEGORY_META,
} from "./wheelUfcModel";

export function WheelUfcSetup() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createWheelUfcRepository(), []);
  const [opponent, setOpponent] = useState<MemberCardSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!challenges.preferredRecipientName || opponent) return;
    const preferred = challenges.members.find((member) => (
      member.displayName.toUpperCase() === challenges.preferredRecipientName.toUpperCase()
    ));
    if (preferred) setOpponent(preferred);
  }, [challenges.members, challenges.preferredRecipientName, opponent]);

  async function createMatch() {
    if (!repository || !opponent || !challenges.activeProfile) return;
    setBusy(true);
    setError("");
    try {
      const profile = await challenges.findProfile(opponent.displayName);
      if (!profile) throw new Error("That Octagon HQ member could not be resolved.");
      const code = await repository.create(profile.id);
      challenges.clearPreparedRecipient();
      await challenges.refresh();
      navigate(`/play/wheel?match=${code}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wheel of UFC challenge could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page football-wheel-page ufc-wheel-page">
      <section className="football-wheel-setup__hero surface-card">
        <p className="eyebrow">UFC CHALLENGE</p>
        <h1>WHEEL OF UFC</h1>
        <strong>Spin. Draft. Build all eight divisions.</strong>
        <p>
          Every spin gives you a restriction. Choose one eligible current UFC fighter
          and lock that fighter into his weight-class slot.
        </p>
      </section>

      <section className="ufc-wheel-categories surface-card">
        <header>
          <div>
            <p className="eyebrow">THE WHEEL</p>
            <h2>Weighted for decisions, not jackpots</h2>
          </div>
          <strong>100%</strong>
        </header>
        <div className="ufc-wheel-categories__grid">
          {WHEEL_UFC_CATEGORY_KEYS.map((key) => {
            const meta = WHEEL_UFC_CATEGORY_META[key];
            return (
              <article key={key}>
                <span>{meta.weight}%</span>
                <strong>{meta.label}</strong>
                <small>{meta.detail}</small>
              </article>
            );
          })}
        </div>
        <p className="ufc-wheel-categories__note">
          If a category has no legal fighter left for your open divisions, it is removed
          from that spin and the remaining weights are rebalanced.
        </p>
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div>
            <small>1</small>
            <span><b>CHOOSE YOUR OPPONENT</b><em>This game is challenge-only</em></span>
          </div>
        </header>
        {challenges.activeProfile ? (
          opponent ? (
            <div className="football-wheel-opponent">
              <i aria-hidden="true">
                {opponent.avatarPhotoData
                  ? <img src={opponent.avatarPhotoData} alt="" />
                  : opponent.initials}
              </i>
              <span>
                <small>OPPONENT SELECTED</small>
                <strong>{opponent.displayName}</strong>
              </span>
              <button type="button" disabled={busy} onClick={() => setOpponent(null)}>
                CHANGE
              </button>
            </div>
          ) : (
            <ChallengeMemberPicker
              members={challenges.members}
              recentNames={challenges.profiles.map((profile) => profile.displayName)}
              selectedName=""
              busy={busy}
              onSelect={setOpponent}
            />
          )
        ) : (
          <div className="football-wheel-setup__signin">
            <p>Sign in to challenge another HQ member.</p>
            <button type="button" onClick={identity.openDialog}>SIGN IN</button>
          </div>
        )}
      </section>

      <section className="football-wheel-setup__rules surface-card">
        <header>
          <p className="eyebrow">HOW IT WORKS</p>
          <strong>16 total turns · 8 picks each</strong>
        </header>
        <div>
          <span><b>1</b> The first player is randomized after the challenge is accepted.</span>
          <span><b>2</b> Spin Champion · Top 5 · 6–15 · Unranked · Country · Young Gun · Veteran.</span>
          <span><b>3</b> Choose an eligible fighter. That fighter automatically fills his own division.</span>
          <span><b>4</b> Young Gun means under 25. Veteran means 10+ UFC fights. Fighters cannot be drafted twice.</span>
          <span><b>5</b> Fighter grades stay hidden. Only the completed eight-fighter team grades are revealed.</span>
        </div>
      </section>

      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}
      <div className="football-wheel-setup__actions">
        <button type="button" className="secondary-action" onClick={() => navigate("/play")}>
          ALL GAMES
        </button>
        <button
          type="button"
          className="primary-action"
          disabled={!repository || !opponent || !challenges.activeProfile || busy}
          onClick={() => void createMatch()}
        >
          {busy
            ? "CREATING MATCH…"
            : opponent
              ? `CHALLENGE ${opponent.displayName.toUpperCase()} →`
              : "CHOOSE AN OPPONENT"}
        </button>
      </div>
    </div>
  );
}
