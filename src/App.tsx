import React from 'react';
import { useGameManager } from './hooks/useGameManager';
import { GameGrid } from './components/GameGrid';
import { ApiLog } from './components/ApiLog';
import { formatClockTime } from './utils/timerUtils';
import './App.css';

export const App: React.FC = () => {
  const {
    games,
    now,
    logs,
    loading,
    activeCount,
    totalCount,
    handleStartGame,
    handleEndGame,
  } = useGameManager();

  const idleCount = totalCount - activeCount;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <div className="header-brand">
            <span className="brand-logo">🎲</span>
            <div>
              <h1 className="header-title">Marico Cafe</h1>
              <div className="header-subtitle">第34回茨香祭 ボードゲーム管理</div>
            </div>
          </div>
          <div className="clock-display" title="現在時刻">
            {formatClockTime(now)}
          </div>
        </div>

        <div className="status-bar">
          <div className="status-item">
            <span className="status-dot dot-active"></span>
            <span className="status-label">利用中:</span>
            <span className="status-num active-num">{activeCount}</span>
          </div>
          <div className="status-item">
            <span className="status-dot dot-idle"></span>
            <span className="status-label">空き:</span>
            <span className="status-num idle-num">{idleCount}</span>
          </div>
          <div className="status-item">
            <span className="status-label">総数:</span>
            <span className="status-num">{totalCount}</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>データを読み込み中...</span>
          </div>
        ) : (
          <GameGrid
            games={games}
            now={now}
            onStart={handleStartGame}
            onEnd={handleEndGame}
          />
        )}
      </main>

      <footer className="app-footer">
        <ApiLog logs={logs} />
      </footer>
    </div>
  );
};

export default App;
