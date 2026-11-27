import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const STOPS = ["outside", "gate", "courtyard", "hall", "pond", "veranda"];

// Vietnam is UTC+7: 13:00 local is golden daylight, 22:00 local is moon.
const LIGHTING = {
  day: "2026-11-27T06:00:00Z",
  night: "2026-11-27T15:00:00Z",
} as const;

const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

const PAGES = [
  { name: "home", url: "/", stop: null },
  { name: "places", url: "/places", stop: null },
  ...STOPS.map((id) => ({ name: id, url: `/visit?stop=${id}`, stop: id })),
];

const root = process.cwd();
const outDir = path.join(root, "captures");
const sheetDir = path.join(outDir, "sheets");
mkdirSync(sheetDir, { recursive: true });

async function sheet(page: Page, id: string, capturePath: string) {
  const shot = readFileSync(capturePath).toString("base64");
  const art = readFileSync(path.join(root, "public", "art", "stops", `${id}.jpg`)).toString("base64");
  await page.setViewportSize({ width: 1700, height: 760 });
  await page.setContent(
    `<body style="margin:0;background:#111;color:#eee;font:14px sans-serif;display:flex;gap:16px;padding:16px;align-items:flex-start">
      <figure style="margin:0"><img style="width:820px" src="data:image/png;base64,${shot}"><figcaption>capture ${id}</figcaption></figure>
      <figure style="margin:0"><img style="width:820px" src="data:image/jpeg;base64,${art}"><figcaption>still ${id}</figcaption></figure>
    </body>`,
  );
  await page.screenshot({ path: path.join(sheetDir, `${id}.png`), fullPage: true });
}

for (const [lighting, time] of Object.entries(LIGHTING)) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    for (const entry of PAGES) {
      test(`${entry.name} ${lighting} ${vpName}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        await page.clock.setFixedTime(new Date(time));
        await page.goto(entry.url, { waitUntil: "load" });

        if (entry.stop) {
          const stage = page.locator('[data-testid="scene-stage"]');
          await stage.waitFor({ state: "attached", timeout: 60_000 });
          await page
            .waitForFunction(
              () => document.querySelector('[data-testid="scene-stage"]')?.getAttribute("data-mode") === "webgl",
              undefined,
              { timeout: 30_000 },
            )
            .catch(() => undefined);
          await expect(stage).toHaveAttribute("data-mode", "webgl");
        }

        await page.waitForTimeout(1500);
        const file = path.join(outDir, `${entry.name}-${lighting}-${vpName}.png`);
        await page.screenshot({ path: file });

        if (entry.stop && lighting === "day" && vpName === "desktop") {
          await sheet(page, entry.stop, file);
        }
        await context.close();
      });
    }
  }
}
