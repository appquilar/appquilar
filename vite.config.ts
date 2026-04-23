import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import istanbul from "vite-plugin-istanbul";
import path from "path";
import type { ProxyOptions } from "vite";

const vendorChunkGroups: Array<[string, string[]]> = [
  ["maps-vendor", ["mapbox-gl", "@googlemaps/"]],
  ["charts-vendor", ["recharts", "date-fns"]],
];

const resolveManualChunk = (id: string): string | undefined => {
  const normalizedId = id.replace(/\\\\/g, "/");

  if (!normalizedId.includes("/node_modules/")) {
    return undefined;
  }

  for (const [chunkName, packages] of vendorChunkGroups) {
    if (packages.some((pkg) => normalizedId.includes(`/node_modules/${pkg}`))) {
      return chunkName;
    }
  }

  return undefined;
};

const DEFAULT_API_BASE_URL = "http://localhost:8000";

const resolveApiOrigin = (): string => {
  const configuredBaseUrl = String(process.env.VITE_API_BASE_URL ?? "").trim();
  const candidate = configuredBaseUrl.length > 0 ? configuredBaseUrl : DEFAULT_API_BASE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_API_BASE_URL;
  }
};

const createSeoProxyConfig = (): Record<string, ProxyOptions> => {
  const target = resolveApiOrigin();
  const sharedOptions: ProxyOptions = {
    target,
    changeOrigin: true,
    secure: false,
  };

  return {
    "/robots.txt": {
      ...sharedOptions,
      rewrite: () => "/seo/robots.txt",
    },
    "/sitemap.xml": {
      ...sharedOptions,
      rewrite: () => "/seo/sitemap.xml",
    },
    "/sitemaps": {
      ...sharedOptions,
      rewrite: (incomingPath) => `/seo${incomingPath}`,
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(() => {
  const enableE2ECoverage = process.env.E2E_COVERAGE === "1";
  const seoProxy = createSeoProxyConfig();

  return ({
  server: {
    host: "::",
    port: 8080,
    proxy: seoProxy,
  },
  preview: {
    proxy: seoProxy,
  },
  plugins: [
    react(),
    enableE2ECoverage
      ? istanbul({
          include: "src/**",
          exclude: ["src/test/**", "node_modules"],
          extension: [".js", ".jsx", ".ts", ".tsx"],
          requireEnv: false,
        })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveManualChunk,
      },
    },
  },
  });
});
