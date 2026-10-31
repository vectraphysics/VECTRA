const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const baseURL = 'http://127.0.0.1:4173/VECTRA/';
const artifacts = path.resolve('mobile-smoke-artifacts');
fs.mkdirSync(artifacts, { recursive: true });

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error('Vite preview did not become ready.');
}

(async () => {
  const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  let browser;
  const failures = [];
  try {
    await waitForServer(baseURL);
    browser = await chromium.launch({
      headless: true,
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
    });

    for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({
        viewport,
        screen: viewport,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });

      for (const route of ['simulations/stellar-life-cycle', 'simulations/orbital-mechanics']) {
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto(baseURL + route, { waitUntil: 'domcontentloaded' });
        await page.locator('.simulation-viewport canvas').waitFor({ state: 'visible' });
        await page.waitForTimeout(1200);

        const layout = await page.evaluate(() => {
          const canvas = document.querySelector('.simulation-viewport canvas');
          const viewport = document.querySelector('.simulation-viewport');
          const rect = canvas?.getBoundingClientRect();
          const buttons = [...document.querySelectorAll('button')].filter((button) => {
            const text = button.innerText.trim();
            return /Play Evolution|Pause|Reset|Prev|Next|Reset Camera|0.25×|0.5×|1×|2×|5×/.test(text);
          });
          return {
            screenWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            canvasWidth: rect?.width ?? 0,
            canvasHeight: rect?.height ?? 0,
            viewportHeight: viewport?.getBoundingClientRect().height ?? 0,
            canvasTouchAction: canvas ? getComputedStyle(canvas).touchAction : 'missing',
            smallControls: buttons.filter((button) => button.getBoundingClientRect().height < 40).map((button) => ({
              text: button.innerText.trim(),
              height: Math.round(button.getBoundingClientRect().height),
            })),
            webgl: Boolean(canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))),
          };
        });

        if (layout.documentWidth > viewport.width) failures.push(`${route} horizontal overflow at ${viewport.width}px: ${layout.documentWidth}px`);
        if (layout.canvasWidth < viewport.width - 2 || layout.canvasHeight < 300) failures.push(`${route} canvas has unexpected dimensions: ${JSON.stringify(layout)}`);
        if (!layout.webgl) failures.push(`${route} did not create a WebGL context at ${viewport.width}px`);
        if (layout.smallControls.length) failures.push(`${route} has undersized primary controls: ${JSON.stringify(layout.smallControls)}`);

        if (route.includes('stellar')) {
          const play = page.getByRole('button', { name: /Play Evolution/ });
          await play.click();
          await page.getByRole('button', { name: 'Pause' }).waitFor();
          await page.getByRole('button', { name: 'Pause' }).click();
          await page.getByRole('button', { name: /Play Evolution/ }).waitFor();

          const massInput = page.locator('input[type="number"]').first();
          await massInput.fill('10');
          await page.getByRole('button', { name: 'Neutron Star' }).waitFor();
          await page.getByRole('button', { name: 'Neutron Star' }).click();
          await page.waitForTimeout(700);
          await page.screenshot({ path: path.join(artifacts, `stellar-${viewport.width}.png`), fullPage: true });
        } else {
          const play = page.getByRole('button', { name: /Play/ }).first();
          if (await play.count()) await play.click();
          await page.waitForTimeout(700);
          await page.screenshot({ path: path.join(artifacts, `orbital-${viewport.width}.png`), fullPage: true });
        }

        if (pageErrors.length) failures.push(`${route} page errors at ${viewport.width}px: ${pageErrors.join(' | ')}`);
        console.log(JSON.stringify({ route, viewport, layout, pageErrors }));
        await page.close();
      }
      await context.close();
    }

    if (failures.length) {
      console.error('MOBILE SMOKE FAILURES:\\n' + failures.join('\\n'));
      process.exitCode = 1;
    } else {
      console.log('Mobile viewport smoke checks passed.');
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
})();
