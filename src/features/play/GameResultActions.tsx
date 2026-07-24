interface GameResultActionsProps {
  onChallenge: () => void;
  onReplay: () => void;
  onAllGames: () => void;
  status?: string;
}

export function GameResultActions({
  onChallenge,
  onReplay,
  onAllGames,
  status = "",
}: GameResultActionsProps) {
  return (
    <div className="game-result-actions-wrap">
      <div className="game-result-actions">
        <button className="primary-action" type="button" onClick={onChallenge}>CHALLENGE SOMEONE</button>
        <button className="find-secondary-action" type="button" onClick={onReplay}>REPLAY</button>
        <button className="find-secondary-action" type="button" onClick={onAllGames}>ALL GAMES</button>
      </div>
      <p className="game-action-status" role="status">{status}</p>
    </div>
  );
}
