// ボードゲームのマスターデータ型
export interface GameDefinition {
  id: string;
  name: string;
  estimatedMinutes: number;
  gridPosition: number; // 1〜12 の配置インデックス
}

// ボードゲームの実行時状態型
export interface GameState {
  status: 'idle' | 'playing';
  startedAt: number | null;        // ゲーム開始時刻 (ミリ秒)
  durationMinutes: number | null;  // 想定プレイ時間 (分)
  estimatedEndAt: number | null;   // 終了目安時刻 (ミリ秒)
  // 将来的なタイマー分離用（現在は startedAt と同時期に計算）
  timerStartedAt?: number | null;
}

// 画面表示用の結合データ
export interface GameWithState extends GameDefinition {
  state: GameState;
}

// API通信ログの記録型
export interface ApiLogEntry {
  id: string;
  timestamp: string; // "HH:MM:SS"
  type: 'REQUEST' | 'RESPONSE' | 'INFO' | 'ERROR';
  endpoint: string;
  data: unknown;
}
