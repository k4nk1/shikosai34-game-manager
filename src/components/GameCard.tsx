import React from 'react';
import { GameWithState } from '../types/game';
import { getRemainingDisplay, formatClockTime } from '../utils/timerUtils';
import './GameCard.css';

interface GameCardProps {
  game: GameWithState;
  now: number;
  onStart: (gameId: string) => void;
  onEnd: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, now, onStart, onEnd }) => {
  const isPlaying = game.state.status === 'playing';

  // タイマー情報
  const remaining = isPlaying
    ? getRemainingDisplay(game.state.estimatedEndAt, now)
    : null;

  const isOvertime = remaining ? remaining.isOvertime : false;

  // 開始ボタンハンドラ (確認ダイアログなしで即時開始)
  const handleStartClick = () => {
    onStart(game.id);
  };

  // 終了ボタンハンドラ
  // 要件:「確認ダイアログは時間が残っているときに終了しようとしたときだけ出してください」
  const handleEndClick = () => {
    if (!isOvertime) {
      const ok = window.confirm(
        `【確認】\n「${game.name}」はまだ予定時間内です。\n本当に終了しますか？`
      );
      if (!ok) return;
    }
    onEnd(game.id);
  };

  // カードのクラス名
  const cardClass = [
    'game-card',
    isPlaying ? 'is-playing' : 'is-idle',
    isOvertime ? 'is-overtime' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass}>
      <div className="card-header">
        <span className="card-pos">#{game.gridPosition}</span>
        <span className="card-status-pill">
          {!isPlaying ? '空き' : isOvertime ? '声掛け!' : '利用中'}
        </span>
      </div>

      <div className="card-title" title={game.name}>
        {game.name}
      </div>

      <div className="card-body">
        {!isPlaying ? (
          <div className="card-info-idle">
            <span className="info-label">目安</span>
            <span className="info-value">{game.estimatedMinutes}分</span>
          </div>
        ) : (
          <div className="card-info-playing">
            <div className={`timer-display ${isOvertime ? 'timer-overtime' : ''}`}>
              <span className="timer-label">{remaining?.label}</span>
              <span className="timer-val">{remaining?.formatted}</span>
            </div>
            <div className="end-time-display">
              {isOvertime ? '予定 ' : '終了 '}
              {formatClockTime(game.state.estimatedEndAt)}
            </div>
          </div>
        )}
      </div>

      <div className="card-action">
        {!isPlaying ? (
          <button
            type="button"
            className="btn btn-start"
            onClick={handleStartClick}
            aria-label={`${game.name} の利用を開始`}
          >
            ▶ 開始
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn-end ${isOvertime ? 'btn-end-urgent' : ''}`}
            onClick={handleEndClick}
            aria-label={`${game.name} の利用を終了`}
          >
            ■ 終了
          </button>
        )}
      </div>
    </div>
  );
};
