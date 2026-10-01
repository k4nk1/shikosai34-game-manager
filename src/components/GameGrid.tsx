import React from 'react';
import { GameWithState } from '../types/game';
import { GameCard } from './GameCard';
import './GameGrid.css';

interface GameGridProps {
  games: GameWithState[];
  now: number;
  onStart: (gameId: string) => void;
  onEnd: (gameId: string) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  now,
  onStart,
  onEnd,
}) => {
  return (
    <div className="grid-wrapper">
      <div className="game-grid">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            now={now}
            onStart={onStart}
            onEnd={onEnd}
          />
        ))}
      </div>
    </div>
  );
};
