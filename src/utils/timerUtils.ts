/**
 * 残り秒数を取得（負の値は超過秒数）
 */
export function getRemainingSeconds(
  estimatedEndTimeMs: number,
  nowMs: number
): number {
  return Math.floor((estimatedEndTimeMs - nowMs) / 1000);
}

/**
 * タイムスタンプを「HH:mm」形式にフォーマット
 */
export function formatClockTime(timestampMs: number | null): string {
  if (!timestampMs) return '--:--';
  const date = new Date(timestampMs);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 秒数を「MM:SS」形式にフォーマット
 */
export function formatMinutesSeconds(totalSeconds: number): string {
  const absSec = Math.abs(totalSeconds);
  const minutes = Math.floor(absSec / 60);
  const seconds = absSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 残り時間の表示オブジェクトを生成
 */
export interface RemainingDisplay {
  label: string;       // "残り" or "超過"
  formatted: string;   // "12:30" or "+01:23"
  isOvertime: boolean; // 残り0以下ならtrue
}

export function getRemainingDisplay(
  estimatedEndTimeMs: number | null,
  nowMs: number
): RemainingDisplay {
  if (!estimatedEndTimeMs) {
    return { label: '待機', formatted: '--:--', isOvertime: false };
  }

  const remainingSeconds = getRemainingSeconds(estimatedEndTimeMs, nowMs);

  if (remainingSeconds < 0) {
    return {
      label: '超過',
      formatted: `+${formatMinutesSeconds(remainingSeconds)}`,
      isOvertime: true,
    };
  }

  return {
    label: '残り',
    formatted: formatMinutesSeconds(remainingSeconds),
    isOvertime: false,
  };
}
