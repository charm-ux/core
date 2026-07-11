/**
 * Type utilities for strongly-typed token path accessors.
 *
 * These types allow `get()` to validate paths against the actual token structure
 * and provide autocomplete in IDEs.
 */

/**
 * Extract branch keys (object values) from a type.
 * These are nested objects like state variants (hover, focus, etc.)
 */
type BranchKeys<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends { light: unknown; dark: unknown }
      ? never // light/dark pairs are not branches
      : K
    : never;
}[keyof T];

/**
 * Typed get function for 1-level access: get('body', 'bgColor')
 */
export type Get1<T> = <K1 extends keyof T & string, K2 extends keyof T[K1] & string>(k1: K1, k2: K2) => string;

/**
 * Typed get function for 2-level access: get('formControl', 'focus', 'borderColor')
 */
export type Get2<T> = <
  K1 extends keyof T & string,
  K2 extends BranchKeys<T[K1]> & string,
  K3 extends keyof T[K1][K2] & string,
>(
  k1: K1,
  k2: K2,
  k3: K3
) => string;

/**
 * Typed get function for 3-level access: get('button', 'primary', 'hover', 'bgColor')
 */
export type Get3<T> = <
  K1 extends keyof T & string,
  K2 extends BranchKeys<T[K1]> & string,
  K3 extends BranchKeys<T[K1][K2]> & string,
  K4 extends keyof T[K1][K2][K3] & string,
>(
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4
) => string;

/**
 * Combined typed get with overloads for different depths.
 */
export type TypedGet<T> = Get1<T> & Get2<T> & Get3<T>;

/**
 * Helper type to extract valid first-level keys
 */
export type FirstLevelKeys<T> = keyof T & string;

/**
 * Helper type to extract valid second-level keys for a given first-level key
 */
export type SecondLevelKeys<T, K1 extends keyof T> = keyof T[K1] & string;

/**
 * Helper type to extract valid third-level keys for given first and second level keys
 */
export type ThirdLevelKeys<T, K1 extends keyof T, K2 extends keyof T[K1]> = keyof T[K1][K2] & string;
