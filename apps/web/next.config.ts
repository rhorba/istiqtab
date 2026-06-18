import { join } from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const WORKSPACE_PACKAGES = [
  "@istiqtab/core",
  "@istiqtab/db",
  "@istiqtab/ai",
  "@istiqtab/incentives",
  "@istiqtab/partners",
  "@istiqtab/wizard",
  "@istiqtab/notifications",
];

// ─── Security headers ─────────────────────────────────────────────────────────
// Applied to every route. Next.js 15 + App Router inlines chunk IDs and hydration
// scripts, so script-src retains 'unsafe-inline' for now — nonce-based CSP is a
// v0.2 hardening task. All other directives are strict.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // R2 public bucket, Google profile photos
      "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://pub-*.r2.dev https://*.googleusercontent.com https://lh3.googleusercontent.com",
      "connect-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Standalone output is only needed for the Docker image, and its build-trace
  // step relies on symlinks (which fail with EPERM on Windows/OneDrive). The
  // Dockerfile sets NEXT_OUTPUT_STANDALONE=1; local `pnpm build` stays portable.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  // Trace files from the monorepo root so the standalone bundle is complete.
  outputFileTracingRoot: join(__dirname, "../../"),
  transpilePackages: WORKSPACE_PACKAGES,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  experimental: {
    typedRoutes: true,
  },
  webpack(config) {
    // Resolve `import "./foo.js"` to ./foo.ts (used by the workspace packages).
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
