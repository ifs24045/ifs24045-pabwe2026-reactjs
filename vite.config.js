import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Meneruskan /api-proxy/* ke API Delcom saat dev dan preview lokal.
// Di Netlify, hal yang sama dikerjakan oleh public/_redirects.
const apiProxy = {
  "/api-proxy": {
    target: "https://open-api.delcom.org",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api-proxy/, "/api/v1"),
  },
};

// Saat build: CSS utama disisipkan langsung ke index.html agar tidak
// memblokir render (menghemat satu request sebelum halaman tampil).
const inlineCss = {
  name: "inline-css",
  apply: "build",
  enforce: "post",
  generateBundle(_, bundle) {
    const html = bundle["index.html"];
    if (!html) return;

    let source = String(html.source);
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (!fileName.endsWith(".css") || chunk.type !== "asset") continue;

      const linkTag = new RegExp(`<link rel="stylesheet"[^>]*href="/${fileName}"[^>]*>`);
      if (!linkTag.test(source)) continue;

      source = source.replace(linkTag, () => `<style>${chunk.source}</style>`);
      delete bundle[fileName];
    }
    html.source = source;
  },
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.APP_PORT) || 3000;

  return {
    plugins: [react(), tailwindcss(), inlineCss],
    server: {
      port,
      proxy: apiProxy,
    },
    preview: {
      port,
      proxy: apiProxy,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(env.VITE_DELCOM_BASEURL || "/api-proxy"),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,jsx}"],
        exclude: [
          "src/main.jsx",
          "src/setupTests.js",
          "src/test-utils.jsx",
          "**/*.test.{js,jsx}",
          "node_modules/**",
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  };
});