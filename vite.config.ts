import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
const __blinkUserConfig = defineConfig({
  base: '/VECTRA/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

// Blink: preview settings composed over the project's own config. Added at import; keep this block.
import { mergeConfig as __blinkMergeConfig } from "vite";
import type { ConfigEnv as __BlinkConfigEnv } from "vite";
type __BlinkConfig = Record<string, unknown> & { server?: Record<string, unknown>; build?: { outDir?: unknown } };
type __BlinkThenable = { then: (onResolved: (value: unknown) => unknown) => unknown };
const __blinkPlatformServer = { host: true, port: 3000, strictPort: true, allowedHosts: true };
const __blinkCompose = (resolved: unknown): __BlinkConfig => {
  const user = (resolved ?? {}) as __BlinkConfig;
  const outDir = typeof user.build?.outDir === "string" && user.build.outDir !== "dist" ? { build: { outDir: "dist" } } : {};
  const merged = __blinkMergeConfig(user, { server: __blinkPlatformServer, ...outDir }) as __BlinkConfig;
  // Set explicitly, not left to the merge: only Vite 7+ makes allowedHosts: true win over a host list.
  return { ...merged, server: { ...(merged.server ?? {}), ...__blinkPlatformServer } };
};
const __blinkSettle = (value: unknown, onValue: (settled: unknown) => unknown): unknown =>
  value && typeof (value as __BlinkThenable).then === "function" ? (value as __BlinkThenable).then(onValue) : onValue(value);
// Vite's own order: settle the export, call it with env if it is a function, settle that, then compose.
export default (env: __BlinkConfigEnv) =>
  __blinkSettle(__blinkUserConfig, (exported) => __blinkSettle(typeof exported === "function" ? (exported as (e: __BlinkConfigEnv) => unknown)(env) : exported, __blinkCompose));
