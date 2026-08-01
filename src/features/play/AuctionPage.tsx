import { Link } from "react-router-dom";
import { auctionModes } from "./auctionContract";

export default function AuctionPage() {
  return (
    <div className="page-stack auction-page">
      <Link className="game-header__back" to="/play">
        <span>‹</span>
        <span><small>PLAY</small><strong>All Games</strong></span>
      </Link>

      <header className="auction-hero surface-card">
        <p className="eyebrow">ASYNCHRONOUS SEALED BID</p>
        <h1>Auction</h1>
        <p>Choose an auction, place private bids, and build a UFC collection asynchronously.</p>
        <strong className="auction-hero__notice">GAMEPLAY NOT YET ENABLED</strong>
      </header>

      <section className="auction-catalog" aria-labelledby="auction-modes-title">
        <header>
          <p className="eyebrow">MODE PREVIEW</p>
          <h2 id="auction-modes-title">Choose your auction</h2>
          <p>Sixteen formats will live under this single Auction game.</p>
        </header>
        <ol>
          {auctionModes.map((mode, index) => (
            <li key={mode.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{mode.displayName}</strong>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
