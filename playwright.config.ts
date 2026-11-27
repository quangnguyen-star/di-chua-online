import { defineConfig } from "@playwright/test";

const noWebgl = process.env.FORCE_NO_WEBGL === "1";

export default defineConfig({
  testDir: "tests/visual",
  testMatch: "capture.spec.ts",
  timeout: 120_000,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000",
    launchOptions: {
      args: noWebgl
        ? ["--disable-gpu", "--disable-webgl", "--disable-3d-apis"]
        : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    },
  },
});
