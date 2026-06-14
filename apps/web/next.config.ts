import { join } from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Workspace packages shipped as raw TypeScript (no build step). Next must
// transpile them, and their NodeNext-style `.js` import specifiers must resolve
// back to the `.ts`/`.tsx` sources.
const WORKSPACE_PACKAGES = [
  "@istiqtab/core",
  "@istiqtab/db",
  "@istiqtab/ai",
  "@istiqtab/incentives",
  "@istiqtab/partners",
  "@istiqtab/wizard",
  "@istiqtab/notifications",
];

const nextConfig: NextConfig = {
  // Standalone output is only needed for the Docker image, and its build-trace
  // step relies on symlinks (which fail with EPERM on Windows/OneDrive). The
  // Dockerfile sets NEXT_OUTPUT_STANDALONE=1; local `pnpm build` stays portable.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  // Trace files from the monorepo root so the standalone bundle is complete.
  outputFileTracingRoot: join(__dirname, "../../"),
  transpilePackages: WORKSPACE_PACKAGES,
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
