import { GameDefinition } from '../types/game';

// 3×4 グリッドに配置する12個の初期ゲーム定義
// ※ 直前でゲームが変更された場合もここを修正、またはAPI連携に切り替え可能
export const INITIAL_GAMES: GameDefinition[] = [
  { id: 'game-01', name: 'カタン', estimatedMinutes: 60, gridPosition: 1 },
  { id: 'game-02', name: 'ドミニオン', estimatedMinutes: 30, gridPosition: 2 },
  { id: 'game-03', name: 'カルカソンヌ', estimatedMinutes: 45, gridPosition: 3 },
  { id: 'game-04', name: 'ブロックス', estimatedMinutes: 30, gridPosition: 4 },
  { id: 'game-05', name: '宝石の煌き', estimatedMinutes: 30, gridPosition: 5 },
  { id: 'game-06', name: '海底探険', estimatedMinutes: 30, gridPosition: 6 },
  { id: 'game-07', name: 'ito', estimatedMinutes: 30, gridPosition: 7 },
  { id: 'game-08', name: 'ナンジャモンジャ', estimatedMinutes: 15, gridPosition: 8 },
  { id: 'game-09', name: 'はぁって言うゲーム', estimatedMinutes: 15, gridPosition: 9 },
  { id: 'game-10', name: 'ドブル', estimatedMinutes: 15, gridPosition: 10 },
  { id: 'game-11', name: '犯人は踊る', estimatedMinutes: 15, gridPosition: 11 },
  { id: 'game-12', name: 'ラブレター', estimatedMinutes: 10, gridPosition: 12 },
];
