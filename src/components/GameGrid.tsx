import React from 'react';
import { DisplayGame } from '../types/game';
import { GameCard } from './GameCard';
import './GameGrid.css';

interface GameGridProps {
  games: DisplayGame[];
  now: number;
  updatingGameId: number | null;
  onStart: (gameId: number) => void;
  onEnd: (gameId: number) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  now,
  updatingGameId,
  onStart,
  onEnd,
}) => {
  return (
    <div className="grid-wrapper">
      <div className="game-grid">
        {games.map((game) => (
          <GameCard
            key={game.gameId}
            game={game}
            now={now}
            isUpdating={updatingGameId === game.gameId}
            onStart={onStart}
            onEnd={onEnd}
          />
        ))}
      </div>
    </div>
  );
};
