import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import istanbul from "vite-plugin-istanbul";
import path from "path";

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

// https://vitejs.dev/config/
export default defineConfig(() => {
  const enableE2ECoverage = process.env.E2E_COVERAGE === "1";

  return ({
  server: {
    host: "::",
    port: 8080,
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
