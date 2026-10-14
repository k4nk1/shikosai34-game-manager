import { ApiGameItem, ApiErrorResult } from '../types/game';

const AUTH_STORAGE_KEY = 'shikosai34_auth_token';
const DEFAULT_BASE_URL = 'https://shikosai-api-staging.sg-tera.workers.dev';
const REQUEST_TIMEOUT_MS = 10000; // 10秒タイムアウト仕様

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (
      (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE_URL
    ).replace(/\/+$/, '');
  }

  /**
   * URLハッシュから認証IDを取得して保持（localStorageに保存）
   * 例: #aB3xK9mP2q や #token=aB3xK9mP2q
   */
  public initAuthTokenFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const rawHash = window.location.hash.replace(/^#/, '').trim();
    if (rawHash) {
      let token = rawHash;
      if (rawHash.includes('=')) {
        try {
          const params = new URLSearchParams(rawHash);
          const candidate =
            params.get('token') ||
            params.get('auth') ||
            params.get('access_token') ||
            params.get('key');
          if (candidate && candidate.trim()) {
            token = candidate.trim();
          }
        } catch {
          // ignore error
        }
      }

      if (token) {
        this.setAuthToken(token);
        // URLのハッシュを消去して画面・履歴に残らないようにする
        if (window.history.replaceState) {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, '', cleanUrl);
        }
        return token;
      }
    }
    return this.getAuthToken();
  }

  /**
   * localStorage から認証IDを取得
   */
  public getAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * localStorage に認証IDを保存
   */
  public setAuthToken(token: string): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, token.trim());
    } catch (e) {
      console.error('Failed to save auth token to localStorage:', e);
    }
  }

  /**
   * localStorage から認証IDを削除
   */
  public clearAuthToken(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth token from localStorage:', e);
    }
  }

  /**
   * 10秒タイムアウト付き fetch ラッパー
   */
  private async fetchWithTimeout(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timerId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw this.createError('TIMEOUT', '通信が10秒でタイムアウトしました', true);
      }
      throw this.createError(
        'NETWORK_ERROR',
        '通信に失敗しました（オフラインまたは接続エラー）',
        true
      );
    } finally {
      clearTimeout(timerId);
    }
  }

  private createError(
    code: ApiErrorResult['code'],
    message: string,
    isUnconfirmed: boolean = false
  ): ApiErrorResult {
    const error = new Error(message) as Error & ApiErrorResult;
    error.code = code;
    error.isUnconfirmed = isUnconfirmed;
    return error;
  }

  /**
   * ゲーム一覧取得 (GET /v1/ctrl/games)
   */
  public async fetchGames(): Promise<ApiGameItem[]> {
    const token = this.getAuthToken();
    if (!token) {
      throw this.createError('UNAUTHENTICATED', '認証IDが設定されていません');
    }

    const response = await this.fetchWithTimeout('/v1/ctrl/games', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw this.createError('UNAUTHENTICATED', '認証IDが正しくありません (401)');
    }

    if (!response.ok) {
      let code: ApiErrorResult['code'] = 'UNKNOWN';
      try {
        const body = await response.json();
        if (body.error) code = body.error;
      } catch {
        // ignore
      }
      throw this.createError(
        code,
        `一覧取得に失敗しました (HTTP ${response.status})`,
        false
      );
    }

    const data: ApiGameItem[] = await response.json();
    return data;
  }

  /**
   * ゲーム状態更新 (POST /v1/ctrl/status/batch)
   * ※本文は指定2項目（gameId, status）のみの配列
   */
  public async updateGameStatus(
    gameId: number,
    status: 'available' | 'in_use'
  ): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
      throw this.createError('UNAUTHENTICATED', '認証IDが設定されていません');
    }

    // 仕様に厳密に従い、余分な項目やnullは一切含めない
    const payload = [
      {
        gameId,
        status,
      },
    ];

    let response: Response;
    try {
      response = await this.fetchWithTimeout('/v1/ctrl/status/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err: unknown) {
      // タイムアウトや通信失敗は「結果未確認」として再送せず例外を送出
      throw err;
    }

    if (response.status === 401) {
      throw this.createError('UNAUTHENTICATED', '認証IDが正しくありません (401)');
    }

    if (response.status === 500) {
      // 500エラーもDBに反映されている可能性があるため結果未確認扱い
      throw this.createError(
        'INTERNAL_ERROR',
        'サーバー内部エラーが発生しました (HTTP 500)',
        true
      );
    }

    if (!response.ok) {
      let code: ApiErrorResult['code'] = 'UNKNOWN';
      try {
        const body = await response.json();
        if (body.error) code = body.error;
      } catch {
        // ignore
      }
      throw this.createError(
        code,
        `状態更新に失敗しました (HTTP ${response.status})`,
        false
      );
    }

    const data = await response.json();
    if (!data.ok) {
      throw this.createError('UNKNOWN', '状態更新の応答が不正です');
    }
  }
}

export const api = new ApiService();
