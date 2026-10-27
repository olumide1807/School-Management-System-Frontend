// How a report card reads marks — mirrored here so the grading sheet shows
// what the card will. The server is the source of truth; these must match:
//   - precision: SMS-main utils/scorePrecision.js
//   - bands:     bandFor in SMS-main utils/buildClassReport.js
// Change both sides together. A teacher who sees one grade on the sheet and
// another on the card will trust neither.

// Marks are one decimal place: scores are refused with more, and totals
// are rounded to it
export const SCORE_DECIMALS = 1;
const FACTOR = 10 ** SCORE_DECIMALS;

export const roundScore = (n: number) => Math.round(n * FACTOR) / FACTOR;

// True if n has no more decimal places than a report card shows
export const hasScorePrecision = (n: number) => Math.abs(n * FACTOR - Math.round(n * FACTOR)) < 1e-9;

// The band a value falls in: the one with the highest lower bound the value
// reaches. Only lower bounds count, so there's no gap between bands — with
// 60–69 and 70–100, a total of 69.5 is in 60–69 — and their order doesn't
// matter.
export function bandFor<T>(
  bands: T[] | null | undefined,
  value: number | null | undefined,
  lowerBoundOf: (band: T) => number | null | undefined,
): T | null {
  if (value === null || value === undefined || !Array.isArray(bands)) return null;
  let best: T | null = null;
  let bestFrom = -Infinity;
  for (const band of bands) {
    const from = lowerBoundOf(band);
    if (typeof from !== "number" || Number.isNaN(from) || value < from) continue;
    if (best === null || from > bestFrom) {
      best = band;
      bestFrom = from;
    }
  }
  return best;
}
