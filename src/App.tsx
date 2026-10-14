import React from 'react';
import { useGameManager } from './hooks/useGameManager';
import { GameGrid } from './components/GameGrid';
import { AuthModal } from './components/AuthModal';
import { formatClockTime } from './utils/timerUtils';
import './App.css';

export const App: React.FC = () => {
  const {
    games,
    now,
    loading,
    isRefreshing,
    updatingGameId,
    activeCount,
    totalCount,
    isAuthModalOpen,
    authError,
    unconfirmedMessage,
    errorMessage,
    currentToken,
    openAuthModal,
    closeAuthModal,
    clearUnconfirmedMessage,
    clearErrorMessage,
    handleSaveAuthToken,
    handleManualRefresh,
    handleStartGame,
    handleEndGame,
  } = useGameManager();

  const idleCount = totalCount - activeCount;

  return (
    <div className="app-container">
      {/* 認証ID入力モーダル */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialToken={currentToken}
        errorMessage={authError}
        onSave={handleSaveAuthToken}
        onClose={closeAuthModal}
        canClose={Boolean(currentToken) && !authError}
      />

      <header className="app-header">
        <div className="header-top">
          <div className="header-brand">
            <span className="brand-logo">🎲</span>
            <div>
              <h1 className="header-title">Marico Cafe</h1>
              <div className="header-subtitle">第34回茨香祭 ボードゲーム管理</div>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className={`btn-icon ${isRefreshing ? 'is-spinning' : ''}`}
              title="データを更新"
              onClick={handleManualRefresh}
              disabled={loading || isRefreshing}
              aria-label="データ更新"
            >
              🔄
            </button>
            <button
              type="button"
              className="btn-icon"
              title="認証設定"
              onClick={openAuthModal}
              aria-label="認証設定"
            >
              🔑
            </button>
            <div className="clock-display" title="現在時刻">
              {formatClockTime(now)}
            </div>
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

      {/* 結果未確認アラート (api.md要件) */}
      {unconfirmedMessage && (
        <div className="alert-banner alert-warning" role="alert">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span className="alert-text">{unconfirmedMessage}</span>
          </div>
          <button
            type="button"
            className="alert-close-btn"
            onClick={clearUnconfirmedMessage}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      )}

      {/* エラー通知 */}
      {errorMessage && (
        <div className="alert-banner alert-error" role="alert">
          <div className="alert-content">
            <span className="alert-icon">⛔</span>
            <span className="alert-text">{errorMessage}</span>
          </div>
          <button
            type="button"
            className="alert-close-btn"
            onClick={clearErrorMessage}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      )}

      <main className="app-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>データを取得中...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="empty-state">
            <p>ゲームデータがありません</p>
            <button
              type="button"
              className="btn-retry"
              onClick={() => handleManualRefresh()}
            >
              再読み込み
            </button>
          </div>
        ) : (
          <GameGrid
            games={games}
            now={now}
            updatingGameId={updatingGameId}
            onStart={handleStartGame}
            onEnd={handleEndGame}
          />
        )}
      </main>
    </div>
  );
};

export default App;
