/**
 * Utility function... so far only used once.
 * Used by async functions to "wait" for some time.
 *
 * @param {number} ms - How many milliseconds to wait.
 * @returns {Promise<"Done!">}
 * @example
 *
 *    pause(1000); // Wait 1000ms, or 1 second.
 */
export async function pause (ms) {
   return await new Promise(resolve => setTimeout(resolve, ms, 'Done!'))
}

/**
 * Utility function... so far only used once.
 * Checks if the value of <code>this</code> array is equal to the values of <code>arr</code>.
 *
 * @param {*[]} arr - An array to check
 * @return {boolean} - Whether the two arrays' values are equal
 * @example
 *
 *    [2, 3].valuesEqual([2, 3]) // true
 *    [2, 3].valuesEqual([2, 4]) // false
 *    [2, 4, [5]].valuesEqual([2, 4, [5]]) // true
 *    [2, 4, [5]].valuesEqual([2, 4, 5]) // false
 */
export function valuesEqual (arr1, arr2) {
   if (arr1 === arr2) {
      return true
   }
   if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
      return false
   }

   for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
         if (!Array.isArray(arr1[i]) || !Array.isArray(arr2[i]) || !valuesEqual(arr1[i], arr2[i])) {
            return false
         }
      }
   }
   return true
}
