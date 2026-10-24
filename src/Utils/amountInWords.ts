// An amount written out in words, as Nigerian receipts carry it beside the
// figures — what stops an altered figure being arguable.
//
//   502000   → "Five hundred and two thousand naira only"
//   15.5     → "Fifteen naira and fifty kobo only"
//   1000015  → "One million and fifteen naira only"
//
// British usage, as on Nigerian receipts and cheques: "and" inside a
// group ("one hundred and five") and before a final part under one
// hundred that follows a larger group ("one thousand and five"). "Naira"
// and "kobo" don't take a plural. Worked in whole kobo so a value like
// 0.1 + 0.2 can't come out as "...and twenty-nine kobo".

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

// 1–99
const underHundred = (n: number): string =>
  n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");

// 1–999
const underThousand = (n: number): string => {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (!hundreds) return underHundred(rest);
  return `${ONES[hundreds]} hundred${rest ? ` and ${underHundred(rest)}` : ""}`;
};

// A whole number in words, 0 upwards
export const wholeNumberInWords = (n: number): string => {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Can't write ${n} in words`);
  if (n === 0) return "zero";

  const groups: number[] = [];
  for (let x = n; x > 0; x = Math.floor(x / 1000)) groups.push(x % 1000);
  if (groups.length > SCALES.length) throw new Error(`Can't write ${n} in words`);

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    const words = underThousand(g) + (SCALES[i] ? ` ${SCALES[i]}` : "");
    // "one thousand and five": a last group under 100, after a larger one
    if (i === 0 && g < 100 && parts.length > 0) parts.push(`and ${words}`);
    else parts.push(words);
  }
  return parts.join(" ");
};

const UNITS: Record<string, { major: string; minor: string }> = {
  NGN: { major: "naira", minor: "kobo" },
};

/**
 * @param amount  in major units (naira), at most two decimal places
 * @param currency ISO code; naira and kobo for NGN, the code itself otherwise
 */
export const amountInWords = (amount: number, currency = "NGN"): string => {
  const totalMinor = Math.round(Number(amount) * 100);
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 0) throw new Error(`Can't write ${amount} in words`);

  const units = UNITS[currency] || { major: currency, minor: "hundredths" };
  const major = Math.floor(totalMinor / 100);
  const minor = totalMinor % 100;

  let text: string;
  if (major && minor) text = `${wholeNumberInWords(major)} ${units.major} and ${wholeNumberInWords(minor)} ${units.minor}`;
  else if (minor) text = `${wholeNumberInWords(minor)} ${units.minor}`;
  else text = `${wholeNumberInWords(major)} ${units.major}`;

  text += " only";
  return text.charAt(0).toUpperCase() + text.slice(1);
};
