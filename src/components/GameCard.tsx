import React from 'react';
import { DisplayGame } from '../types/game';
import { getRemainingDisplay, formatClockTime } from '../utils/timerUtils';
import './GameCard.css';

interface GameCardProps {
  game: DisplayGame;
  now: number;
  isUpdating: boolean;
  onStart: (gameId: number) => void;
  onEnd: (gameId: number) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  now,
  isUpdating,
  onStart,
  onEnd,
}) => {
  const isPlaying = game.status === 'in_use';

  // タイマー情報 (利用中の場合のみ計算)
  const remaining = isPlaying
    ? getRemainingDisplay(game.expectedEndAtMs, now)
    : null;

  const isOvertime = remaining ? remaining.isOvertime : false;

  // 開始ボタンハンドラ (確認ダイアログなしで即時開始)
  const handleStartClick = () => {
    if (isUpdating) return;
    onStart(game.gameId);
  };

  // 終了ボタンハンドラ
  // 要件:「確認ダイアログは時間が残っているときに終了しようとしたときだけ出してください」
  const handleEndClick = () => {
    if (isUpdating) return;
    if (!isOvertime) {
      const ok = window.confirm(
        `【確認】\n「${game.name}」はまだ予定時間内です。\n本当に終了（空きに戻す）しますか？`
      );
      if (!ok) return;
    }
    onEnd(game.gameId);
  };

  // カードのクラス名
  const cardClass = [
    'game-card',
    isPlaying ? 'is-playing' : 'is-idle',
    isOvertime ? 'is-overtime' : '',
    isUpdating ? 'is-updating' : '',
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
            <span className="info-idle-badge">利用可能</span>
          </div>
        ) : (
          <div className="card-info-playing">
            <div className={`timer-display ${isOvertime ? 'timer-overtime' : ''}`}>
              <span className="timer-label">{remaining?.label}</span>
              <span className="timer-val">{remaining?.formatted}</span>
            </div>
            <div className="end-time-display">
              {isOvertime ? '予定 ' : '終了 '}
              {formatClockTime(game.expectedEndAtMs)}
            </div>
          </div>
        )}
      </div>

      <div className="card-action">
        {!isPlaying ? (
          <button
            type="button"
            className="btn btn-start"
            disabled={isUpdating}
            onClick={handleStartClick}
            aria-label={`${game.name} の利用を開始`}
          >
            {isUpdating ? '通信中...' : '▶ 開始'}
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn-end ${isOvertime ? 'btn-end-urgent' : ''}`}
            disabled={isUpdating}
            onClick={handleEndClick}
            aria-label={`${game.name} の利用を終了`}
          >
            {isUpdating ? '通信中...' : '■ 終了'}
          </button>
        )}
      </div>
    </div>
  );
};
