// @vitest-environment node
import { describe, expect, test } from "vitest";
import { amountInWords } from "./amountInWords.ts";

const cases: [number, string][] = [
  [502000, "Five hundred and two thousand naira only"],
  [15, "Fifteen naira only"],
  [1000000, "One million naira only"],
  [1, "One naira only"],
  [0, "Zero naira only"],
  [21, "Twenty-one naira only"],
  [100, "One hundred naira only"],
  [115, "One hundred and fifteen naira only"],
  [1005, "One thousand and five naira only"],
  [1015, "One thousand and fifteen naira only"],
  [1100, "One thousand one hundred naira only"],
  [1105, "One thousand one hundred and five naira only"],
  [2000, "Two thousand naira only"],
  [10000, "Ten thousand naira only"],
  [100000, "One hundred thousand naira only"],
  [250000, "Two hundred and fifty thousand naira only"],
  [1000015, "One million and fifteen naira only"],
  [1000100, "One million one hundred naira only"],
  [1250000, "One million two hundred and fifty thousand naira only"],
  [2500000.5, "Two million five hundred thousand naira and fifty kobo only"],
  [15.5, "Fifteen naira and fifty kobo only"],
  [15.05, "Fifteen naira and five kobo only"],
  [0.5, "Fifty kobo only"],
  [0.01, "One kobo only"],
  [150000.5, "One hundred and fifty thousand naira and fifty kobo only"],
  [0.1 + 0.2, "Thirty kobo only"],
  [999999999.99, "Nine hundred and ninety-nine million nine hundred and ninety-nine thousand nine hundred and ninety-nine naira and ninety-nine kobo only"],
  [1000000000, "One billion naira only"],
  [7000000001, "Seven billion and one naira only"],
];

describe("amountInWords", () => {
  test.each(cases)("%s → %s", (amount, expected) => {
    expect(amountInWords(amount)).toBe(expected);
  });

  // Nonsense on a receipt is worse than an error
  test.each([-5, NaN, Infinity])("throws on %s", (bad) => {
    expect(() => amountInWords(bad)).toThrow();
  });
});
