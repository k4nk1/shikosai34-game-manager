import { GameDefinition, GameState, ApiLogEntry } from '../types/game';
import { INITIAL_GAMES } from '../data/gameData';

export interface GameStartPayload {
  gameId: string;
  gameName: string;
  startedAt: string;        // ISO 8601 文字列 (例: "2026-10-01T10:00:00.000Z")
  startedAtMs: number;
  estimatedMinutes: number;
  estimatedEndAt: string;   // ISO 8601 文字列
  estimatedEndAtMs: number;
}

export interface GameEndPayload {
  gameId: string;
  gameName: string;
  endedAt: string;          // ISO 8601 文字列
  endedAtMs: number;
}

type LogListener = (entry: ApiLogEntry) => void;

class ApiClient {
  private logListeners: LogListener[] = [];
  // 将来の本番APIベースURL (例: https://api.example.com)
  private baseUrl: string = '/api';

  // ログ購読
  public onLog(listener: LogListener): () => void {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== listener);
    };
  }

  private emitLog(
    type: ApiLogEntry['type'],
    endpoint: string,
    data: unknown
  ): void {
    const now = new Date();
    const timestamp = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join(':');

    const entry: ApiLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      type,
      endpoint,
      data,
    };

    console.log(`[API ${type}] ${endpoint}:`, data);
    this.logListeners.forEach((listener) => listener(entry));
  }

  /**
   * ゲームマスターデータ取得
   * ※将来はGET /api/games に差し替え
   */
  public async fetchGames(): Promise<GameDefinition[]> {
    this.emitLog('REQUEST', `${this.baseUrl}/games (GET)`, {
      description: 'ゲーム一覧取得リクエスト',
    });

    // TODO: 実際のAPIサーバー完成時は以下の fetch を有効化
    /*
    const response = await fetch(`${this.baseUrl}/games`);
    const data = await response.json();
    this.emitLog('RESPONSE', `${this.baseUrl}/games`, data);
    return data;
    */

    // 現在はローカル定義のデータを返す (通信シミュレーションのため擬似Promise)
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.emitLog('RESPONSE', `${this.baseUrl}/games (GET)`, {
      count: INITIAL_GAMES.length,
      games: INITIAL_GAMES,
    });

    return INITIAL_GAMES;
  }

  /**
   * 現在の利用状況取得（ページロード時）
   * ※将来はGET /api/status に差し替え
   */
  public async fetchCurrentStatuses(): Promise<Record<string, GameState>> {
    this.emitLog('REQUEST', `${this.baseUrl}/status (GET)`, {
      description: '全ゲームの現在の利用状況・終了予定時刻の取得リクエスト',
    });

    // TODO: 実際のAPIサーバー完成時は以下の fetch を有効化
    /*
    const response = await fetch(`${this.baseUrl}/status`);
    const data = await response.json();
    this.emitLog('RESPONSE', `${this.baseUrl}/status`, data);
    return data;
    */

    // 現在はブラウザの localStorage から復元を試みる（リロード時のテストにも便利）
    await new Promise((resolve) => setTimeout(resolve, 100));

    let savedStates: Record<string, GameState> = {};
    try {
      const stored = localStorage.getItem('shikosai34_game_states');
      if (stored) {
        savedStates = JSON.parse(stored);
      }
    } catch {
      savedStates = {};
    }

    this.emitLog('RESPONSE', `${this.baseUrl}/status (GET)`, {
      description: '取得した利用状況',
      states: savedStates,
    });

    return savedStates;
  }

  /**
   * ゲーム利用開始通知
   * ※将来はPOST /api/games/:id/start に差し替え
   */
  public async notifyGameStart(payload: GameStartPayload): Promise<void> {
    const endpoint = `${this.baseUrl}/games/${payload.gameId}/start (POST)`;
    this.emitLog('REQUEST', endpoint, payload);

    // TODO: 実際のAPIサーバー完成時は以下の fetch を有効化
    /*
    await fetch(`${this.baseUrl}/games/${payload.gameId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    */

    await new Promise((resolve) => setTimeout(resolve, 80));

    this.emitLog('RESPONSE', endpoint, {
      status: 'OK',
      message: `${payload.gameName} の利用を開始しました`,
    });
  }

  /**
   * ゲーム利用終了通知
   * ※将来はPOST /api/games/:id/end に差し替え
   */
  public async notifyGameEnd(payload: GameEndPayload): Promise<void> {
    const endpoint = `${this.baseUrl}/games/${payload.gameId}/end (POST)`;
    this.emitLog('REQUEST', endpoint, payload);

    // TODO: 実際のAPIサーバー完成時は以下の fetch を有効化
    /*
    await fetch(`${this.baseUrl}/games/${payload.gameId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    */

    await new Promise((resolve) => setTimeout(resolve, 80));

    this.emitLog('RESPONSE', endpoint, {
      status: 'OK',
      message: `${payload.gameName} の利用を終了しました`,
    });
  }
}

export const api = new ApiClient();
