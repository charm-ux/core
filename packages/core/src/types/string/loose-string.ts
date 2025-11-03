/**
 * Offers auto complete, but allows for additional values.
 * @ignore - https://twitter.com/mattpocockuk/status/1506607945445949446
 *
 * @example:
 *  type Target = LooseString<'_self' | '_blank' | '_parent' | '_top'>
 *  Still allows for the custom name of a framename.
 *
 * @param T are the options that typescript auto completes.
 */
export type LooseString<T extends string> = T | Omit<string, T>;
