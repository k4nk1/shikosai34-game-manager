import { useState, useEffect, useCallback, useRef } from 'react';
import { GameDefinition, GameState, GameWithState, ApiLogEntry } from '../types/game';
import { api, GameStartPayload, GameEndPayload } from '../services/api';
import { calculateEstimatedEndTime } from '../utils/timerUtils';

const STORAGE_KEY = 'shikosai34_game_states';

export function useGameManager() {
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [gameStates, setGameStates] = useState<Record<string, GameState>>({});
  const [now, setNow] = useState<number>(Date.now());
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // localStorage へのバックアップ同期
  const saveStatesToStorage = (states: Record<string, GameState>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // 1. 初回マウント時: APIログ購読、ゲーム定義取得、利用状況取得
  useEffect(() => {
    const unsubscribe = api.onLog((entry) => {
      setLogs((prev) => [entry, ...prev].slice(0, 50)); // 最新50件保持
    });

    const initData = async () => {
      setLoading(true);
      try {
        const [loadedGames, loadedStatuses] = await Promise.all([
          api.fetchGames(),
          api.fetchCurrentStatuses(),
        ]);

        setGames(loadedGames);

        // 初期ステートマップの作成
        const mergedStates: Record<string, GameState> = {};
        loadedGames.forEach((game) => {
          if (loadedStatuses[game.id]) {
            mergedStates[game.id] = loadedStatuses[game.id];
          } else {
            mergedStates[game.id] = {
              status: 'idle',
              startedAt: null,
              durationMinutes: null,
              estimatedEndAt: null,
            };
          }
        });

        setGameStates(mergedStates);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. 毎秒のタイマー更新
  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  // 最新の gameStates を参照するための Ref
  const gameStatesRef = useRef(gameStates);
  gameStatesRef.current = gameStates;

  const gamesRef = useRef(games);
  gamesRef.current = games;

  /**
   * 将来のタイマー分離に備えた独立タイマー計算処理
   */
  const computeTimer = useCallback((startTime: number, durationMinutes: number) => {
    const estimatedEnd = calculateEstimatedEndTime(startTime, durationMinutes);
    return {
      startedAt: startTime,
      durationMinutes,
      estimatedEndAt: estimatedEnd,
      timerStartedAt: startTime,
    };
  }, []);

  /**
   * ゲーム利用開始
   * （現在は「開始ボタン押下」と「タイマー開始」を同時に実行）
   */
  const handleStartGame = useCallback(
    async (gameId: string) => {
      const targetGame = gamesRef.current.find((g) => g.id === gameId);
      if (!targetGame) return;

      const startedAt = Date.now();
      const timerInfo = computeTimer(startedAt, targetGame.estimatedMinutes);

      const nextState: GameState = {
        status: 'playing',
        ...timerInfo,
      };

      const updated = {
        ...gameStatesRef.current,
        [gameId]: nextState,
      };

      setGameStates(updated);
      saveStatesToStorage(updated);

      const payload: GameStartPayload = {
        gameId: targetGame.id,
        gameName: targetGame.name,
        startedAt: new Date(startedAt).toISOString(),
        startedAtMs: startedAt,
        estimatedMinutes: targetGame.estimatedMinutes,
        estimatedEndAt: new Date(timerInfo.estimatedEndAt).toISOString(),
        estimatedEndAtMs: timerInfo.estimatedEndAt,
      };

      await api.notifyGameStart(payload);
    },
    [computeTimer]
  );

  /**
   * ゲーム利用終了
   */
  const handleEndGame = useCallback(async (gameId: string) => {
    const targetGame = gamesRef.current.find((g) => g.id === gameId);
    if (!targetGame) return;

    const endedAt = Date.now();

    const nextState: GameState = {
      status: 'idle',
      startedAt: null,
      durationMinutes: null,
      estimatedEndAt: null,
      timerStartedAt: null,
    };

    const updated = {
      ...gameStatesRef.current,
      [gameId]: nextState,
    };

    setGameStates(updated);
    saveStatesToStorage(updated);

    const payload: GameEndPayload = {
      gameId: targetGame.id,
      gameName: targetGame.name,
      endedAt: new Date(endedAt).toISOString(),
      endedAtMs: endedAt,
    };

    await api.notifyGameEnd(payload);
  }, []);

  // グリッド位置順にソートしたゲーム一覧（状態付き）
  const gamesWithState: GameWithState[] = games
    .slice()
    .sort((a, b) => a.gridPosition - b.gridPosition)
    .map((game) => ({
      ...game,
      state: gameStates[game.id] || {
        status: 'idle',
        startedAt: null,
        durationMinutes: null,
        estimatedEndAt: null,
      },
    }));

  const activeCount = Object.values(gameStates).filter((s) => s.status === 'playing').length;
  const totalCount = games.length;

  return {
    games: gamesWithState,
    now,
    logs,
    loading,
    activeCount,
    totalCount,
    handleStartGame,
    handleEndGame,
  };
}
