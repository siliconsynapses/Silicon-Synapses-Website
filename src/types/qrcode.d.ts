/**
 * Minimal ambient types for the optional `qrcode` dependency (only src/lib/qr.ts
 * uses it, via a guarded dynamic import). Keeps `tsc` green whether or not the
 * package is installed. Remove this shim if `@types/qrcode` is ever added.
 */
declare module "qrcode" {
  export interface QRCodeToStringOptions {
    type?: "svg" | "utf8" | "terminal";
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  }
  export function toString(
    text: string,
    options?: QRCodeToStringOptions,
  ): Promise<string>;
  const _default: { toString: typeof toString };
  export default _default;
}
