/**
 * Gets the sum of all numbers passed in
 * @customTagTest {Array} Some info to make documentation easier
 * @param numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
