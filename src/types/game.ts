// API (api.md) のレスポンス型
export interface ApiGameItem {
  gameId: number;
  name: string;
  status: 'available' | 'in_use';
  expectedEndAt: string | null; // ISO 8601 文字列 (例: "2026-10-08T01:30:00.000Z")
}

// 画面表示用のゲームデータ型
export interface DisplayGame {
  gameId: number;
  name: string;
  status: 'available' | 'in_use';
  expectedEndAtMs: number | null; // パース済みミリ秒タイムスタンプ
  gridPosition: number;          // 1〜N の表示位置
}

// APIエラー分類
export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'GAME_NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface ApiErrorResult {
  code: ApiErrorCode;
  message: string;
  isUnconfirmed: boolean; // 500, タイムアウト, 通信失敗などの「結果未確認」フラグ
}
