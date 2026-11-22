export const MIN_DURATION = 5;
export const MAX_DURATION = 40;
export function filmLength(value) {
  return Math.max(MIN_DURATION, Math.min(MAX_DURATION, Math.round(Number(value) || 12)));
}
export function maxClipLength(totalDuration) {
  return Math.max(0.5, filmLength(totalDuration) - 3.3);
}
export function clipRange(start, end, sourceLength, totalDuration) {
  const length = Number.isFinite(Number(sourceLength)) && Number(sourceLength) > 0 ? Number(sourceLength) : 0;
  const max = maxClipLength(totalDuration);
  const s = Math.max(0, Math.min(length, Number(start) || 0));
  const e = Math.max(s, Math.min(length, Number(end) || (s + Math.min(6,max)), s + max));
  return { start: s, end: e };
}
export function videoWindow(filmDuration, start, end, hasVideo) {
  const duration = filmLength(filmDuration);
  if (!hasVideo) return { duration, start: null, end: null, clipLength: 0 };
  const available = maxClipLength(duration);
  const clipLength = Math.min(available, Math.max(0, (Number(end) || 0) - (Number(start) || 0)));
  const at = 1.4 + Math.max(0, (duration - 3.3 - clipLength) / 2);
  return { duration, start: at, end: at + clipLength, clipLength };
}
