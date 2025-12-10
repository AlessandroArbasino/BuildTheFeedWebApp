/**
 * Estimate when a prompt will be used from the queue using Local Time.
 * Env vars used:
 * - PROMPTS_PER_DAY (integer, >=1). Defaults to 1 if missing/invalid.
 * - DAILY_POST_TIME (string HH:MM 24h). Defaults to '09:00' if missing/invalid.
 *
 * Algorithm:
 * - Work in the user's Local Time (browser time).
 * - Determine the daily schedule based on start time and frequency.
 * - Find the sequence of *future* available slots starting from now.
 * - Skip `previousCount` slots to find the target slot for the new prompt.
 *
 * @param {number} previousCount Number of prompts already ahead in the queue (>=0)
 * @returns {string} ISO datetime string of the scheduled usage time
 */
export function estimatePromptUseTime(previousCount) {
  // 1. Configuration
  // Try NEXT_PUBLIC_ first for client-side access, then fallback
  const perDayRaw = parseInt(process.env.PROMPTS_PER_DAY, 10);
  const perDay = Number.isFinite(perDayRaw) && perDayRaw > 0 ? perDayRaw : 1;

  const timeStr = (process.env.DAILY_POST_TIME || '09:00').trim();
  const [hhStr, mmStr] = timeStr.split(':');
  let baseHour = parseInt(hhStr, 10);
  let baseMin = parseInt(mmStr, 10);
  if (!Number.isFinite(baseHour) || baseHour < 0 || baseHour > 23) baseHour = 9;
  if (!Number.isFinite(baseMin) || baseMin < 0 || baseMin > 59) baseMin = 0;

  // Interval between posts in milliseconds
  const intervalMs = Math.floor((24 * 60 * 60 * 1000) / perDay);

  // 2. Current Time
  const now = new Date();

  // 3. Define "Today's Schedule Start" in Local Time
  // We create a date object for today at the base hour/min
  const todayStart = new Date(now);
  todayStart.setHours(baseHour, baseMin, 0, 0);

  // 4. Find valid future slots remaining for "Today"
  const validSlotsToday = [];
  for (let i = 0; i < perDay; i++) {
    const slotTime = new Date(todayStart.getTime() + i * intervalMs);
    // A slot is valid if it is in the future
    if (slotTime > now) {
      validSlotsToday.push(slotTime);
    }
  }

  // 5. Select the target slot
  // If the target is within today's remaining slots
  if (previousCount < validSlotsToday.length) {
    return validSlotsToday[previousCount].toISOString();
  }

  // If we need to look at future days
  const remainingCount = previousCount - validSlotsToday.length;

  // Calculate how many full days into the future we need to go
  // Start from tomorrow (= 1 day offset)
  // Each future day has a full `perDay` set of slots
  const daysInFuture = 1 + Math.floor(remainingCount / perDay);
  const slotIndexInTargetDay = remainingCount % perDay;

  // Construct target date
  const targetDate = new Date(todayStart);
  targetDate.setDate(targetDate.getDate() + daysInFuture);

  // Add time offset within that day
  // Note: We use the same base start time + index * interval 
  const targetTimeMs = targetDate.getTime() + slotIndexInTargetDay * intervalMs;

  return new Date(targetTimeMs).toISOString();
}
