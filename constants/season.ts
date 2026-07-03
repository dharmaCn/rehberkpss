export const SEASON_ID = 's2';
export const SEASON_LABEL = 'Sezon 2';
export const SEASON_START_AT = '2026-06-20';
export const SEASON_END_AT = '2026-09-20';
export const SEASON_MODAL_STORAGE_KEY = `seen_season_modal_${SEASON_ID}`;

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}
