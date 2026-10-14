import { useState, useEffect, useCallback, useRef } from 'react';
import { DisplayGame, ApiGameItem, ApiErrorResult } from '../types/game';
import { api } from '../services/api';

const AUTO_REFRESH_INTERVAL_MS = 60000; // 60秒同期

export function useGameManager() {
  const [games, setGames] = useState<DisplayGame[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [updatingGameId, setUpdatingGameId] = useState<number | null>(null);

  // 認証関連ステート
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // アラート関連ステート (結果未確認・エラー通知)
  const [unconfirmedMessage, setUnconfirmedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // APIレスポンスを画面用データに変換
  const mapApiGamesToDisplay = useCallback((items: ApiGameItem[]): DisplayGame[] => {
    // ID順にソート (api.md: "ID順に返します")
    const sorted = [...items].sort((a, b) => a.gameId - b.gameId);
    return sorted.map((item, index) => {
      const expectedEndAtMs = item.expectedEndAt
        ? new Date(item.expectedEndAt).getTime()
        : null;

      return {
        gameId: item.gameId,
        name: item.name,
        status: item.status,
        expectedEndAtMs,
        gridPosition: index + 1,
      };
    });
  }, []);

  /**
   * ゲーム一覧取得
   */
  const loadGames = useCallback(
    async (isInitial = false) => {
      const token = api.getAuthToken();
      if (!token) {
        setIsAuthModalOpen(true);
        setLoading(false);
        return;
      }

      if (isInitial) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const items = await api.fetchGames();
        setGames(mapApiGamesToDisplay(items));
        setAuthError(null);
        setErrorMessage(null);
      } catch (err: unknown) {
        const apiError = err as ApiErrorResult;
        console.error('Failed to load games:', apiError);

        if (apiError.code === 'UNAUTHENTICATED') {
          setAuthError('認証IDが正しくありません (401)');
          setIsAuthModalOpen(true);
        } else {
          setErrorMessage(apiError.message || 'データ取得に失敗しました');
        }
      } finally {
        if (isInitial) setLoading(false);
        setIsRefreshing(false);
      }
    },
    [mapApiGamesToDisplay]
  );

  // 初回マウント
  useEffect(() => {
    // URLハッシュから認証IDを読み取り・保持
    api.initAuthTokenFromUrl();
    loadGames(true);

    const handleHashChange = () => {
      const token = api.initAuthTokenFromUrl();
      if (token) {
        loadGames(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loadGames]);

  // 1秒ごとの時計更新
  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // 60秒ごとの自動ポーリング & 画面復帰時の自動再取得
  useEffect(() => {
    const intervalId = setInterval(() => {
      // 画面が表示されているときのみポーリング
      if (document.visibilityState === 'visible') {
        loadGames(false);
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadGames(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadGames]);

  // 状態更新のRef保持
  const loadGamesRef = useRef(loadGames);
  loadGamesRef.current = loadGames;

  /**
   * ゲーム利用開始 (status: "in_use")
   */
  const handleStartGame = useCallback(async (gameId: number) => {
    setUpdatingGameId(gameId);
    setUnconfirmedMessage(null);
    setErrorMessage(null);

    try {
      await api.updateGameStatus(gameId, 'in_use');
      // 成功時: 最新の一覧・予定終了時刻を取得
      await loadGamesRef.current(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResult;
      console.error('Start game error:', apiError);

      if (apiError.isUnconfirmed) {
        // 仕様: 結果未確認として一覧を再取得（自動再送はしない）
        setUnconfirmedMessage(
          `【結果未確認】通信が不安定またはサーバーエラーが発生しました。自動再送は行いません。現状を確認します。`
        );
        await loadGamesRef.current(false);
      } else if (apiError.code === 'UNAUTHENTICATED') {
        setAuthError('認証IDが正しくありません (401)');
        setIsAuthModalOpen(true);
      } else {
        setErrorMessage(`開始エラー: ${apiError.message}`);
        await loadGamesRef.current(false);
      }
    } finally {
      setUpdatingGameId(null);
    }
  }, []);

  /**
   * ゲーム利用終了 (status: "available")
   */
  const handleEndGame = useCallback(async (gameId: number) => {
    setUpdatingGameId(gameId);
    setUnconfirmedMessage(null);
    setErrorMessage(null);

    try {
      await api.updateGameStatus(gameId, 'available');
      // 成功時: 最新の一覧を取得して空き状態へ
      await loadGamesRef.current(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResult;
      console.error('End game error:', apiError);

      if (apiError.isUnconfirmed) {
        // 仕様: 結果未確認として一覧を再取得（自動再送はしない）
        setUnconfirmedMessage(
          `【結果未確認】通信が不安定またはサーバーエラーが発生しました。自動再送は行いません。現状を確認します。`
        );
        await loadGamesRef.current(false);
      } else if (apiError.code === 'UNAUTHENTICATED') {
        setAuthError('認証IDが正しくありません (401)');
        setIsAuthModalOpen(true);
      } else {
        setErrorMessage(`終了エラー: ${apiError.message}`);
        await loadGamesRef.current(false);
      }
    } finally {
      setUpdatingGameId(null);
    }
  }, []);

  /**
   * 認証ID保存
   */
  const handleSaveAuthToken = useCallback((token: string) => {
    api.setAuthToken(token);
    setAuthError(null);
    setIsAuthModalOpen(false);
    loadGamesRef.current(true);
  }, []);

  /**
   * 手動更新ボタン押下
   */
  const handleManualRefresh = useCallback(() => {
    loadGames(false);
  }, [loadGames]);

  const activeCount = games.filter((g) => g.status === 'in_use').length;
  const totalCount = games.length;

  return {
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
    currentToken: api.getAuthToken() || '',
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
    clearUnconfirmedMessage: () => setUnconfirmedMessage(null),
    clearErrorMessage: () => setErrorMessage(null),
    handleSaveAuthToken,
    handleManualRefresh,
    handleStartGame,
    handleEndGame,
  };
}
