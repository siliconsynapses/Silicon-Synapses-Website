import "server-only";

/**
 * Render an SVG QR code for `text` (the absolute pass URL).
 *
 * Uses the optional `qrcode` package via a guarded dynamic import so the build
 * stays green before the dependency is installed — the digital pass still works
 * via its printed token; the scannable code simply appears once `qrcode` is
 * present. `qrcode` is listed in next.config `serverExternalPackages`, so it is
 * required at runtime (not bundled) and a missing package degrades to `null`
 * instead of breaking the build.
 */
export async function passQrSvg(text: string): Promise<string | null> {
  try {
    const mod = await import("qrcode");
    return await mod.toString(text, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 232,
      color: { dark: "#0a0f1e", light: "#ffffff" },
    });
  } catch {
    // Package not installed yet, or generation failed — pass still works by token.
    return null;
  }
}
