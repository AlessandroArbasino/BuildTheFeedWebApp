/**
 * Estimate when a prompt will be used from the queue.
 * Env vars used:
 * - PROMPTS_PER_DAY (integer, >=1). Defaults to 1 if missing/invalid.
 * - DAILY_POST_TIME (string HH:MM 24h). Defaults to '09:00' if missing/invalid.
 *
 * Algorithm:
 * - Determine the next available posting slot starting from now.
 * - Distribute posts evenly across the day based on PROMPTS_PER_DAY.
 * - The first slot of each day is at DAILY_POST_TIME; subsequent slots are spaced evenly.
 * - All calculations are in UTC; the returned value is an ISO UTC string.
 *
 * @param {number} previousCount Number of prompts already ahead in the queue (>=0)
 * @returns {string} ISO datetime string of the scheduled usage time
 */
export function estimatePromptUseTime(previousCount) {
  const perDayRaw = parseInt(process.env.PROMPTS_PER_DAY, 10);
  const perDay = Number.isFinite(perDayRaw) && perDayRaw > 0 ? perDayRaw : 1;

  const timeStr = (process.env.DAILY_POST_TIME || '09:00').trim();
  const [hhStr, mmStr] = timeStr.split(':');
  let baseHour = parseInt(hhStr, 10);
  let baseMin = parseInt(mmStr, 10);
  if (!Number.isFinite(baseHour) || baseHour < 0 || baseHour > 23) baseHour = 9;
  if (!Number.isFinite(baseMin) || baseMin < 0 || baseMin > 59) baseMin = 0;

  const intervalMinutes = Math.floor(1440 / perDay);

  // Work in UTC
  const now = new Date();
  const nowMs = now.getTime();
  const startDayUTCms = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    baseHour,
    baseMin,
    0,
    0
  );

  // Determine the first available slot index from "now"
  let nextDayOffset = 0;
  if (nowMs > (startDayUTCms + (perDay - 1) * intervalMinutes * 60 * 1000)) {
    // All today's slots have passed; start from tomorrow
    nextDayOffset = 1;
  }

  // If starting today, find the next slot today; else start from 0 tomorrow
  let nextSlotIndexToday = 0;
  if (nextDayOffset === 0) {
    // iterate slots today to find the first not passed
    for (let i = 0; i < perDay; i++) {
      const slotTimeMs = startDayUTCms + i * intervalMinutes * 60 * 1000;
      if (slotTimeMs >= nowMs) {
        nextSlotIndexToday = i;
        break;
      }
      // If all passed, we would have set nextDayOffset=1 above, so this is safe
    }
  }

  // Convert starting point to absolute index space
  const startAbsoluteIndex = nextDayOffset * perDay + (nextDayOffset === 0 ? nextSlotIndexToday : 0);
  const absoluteIndex = startAbsoluteIndex + Math.max(0, Number(previousCount) || 0);

  const dayOffset = Math.floor(absoluteIndex / perDay);
  const indexInDay = absoluteIndex % perDay;

  const targetDayStartUTCms = startDayUTCms + dayOffset * 24 * 60 * 60 * 1000;
  const scheduledMs = targetDayStartUTCms + indexInDay * intervalMinutes * 60 * 1000;
  const scheduled = new Date(scheduledMs);

  return scheduled.toISOString();
}
