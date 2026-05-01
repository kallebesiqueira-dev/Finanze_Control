import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "screenshots");
const BASE = "http://localhost:3000";

const EMAIL = "mario@test.com";
const PASSWORD = "password123";

async function shot(page, name) {
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  console.log(`✓ ${name}`);
}

(async () => {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1 — Login page
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
  await shot(page, "01-login.png");

  // 2 — Login page with error
  await page.type('input[type="email"]', "wrong@test.com");
  await page.type('input[type="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1500));
  await shot(page, "02-login-error.png");

  // 3 — Register page
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle0" });
  await shot(page, "03-register.png");

  // 4 — Login with valid user
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await shot(page, "04-dashboard.png");

  // 5 — Open the "Nuova Movimentazione" form
  const btnText = await page.$$eval("button", (btns) =>
    btns.map((b) => ({ text: b.textContent, idx: b.textContent }))
  );
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => el.textContent);
    if (text && text.includes("Nuova")) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, "05-dashboard-form.png");

  // 6 — Fill in a new income transaction
  await page.type('input[placeholder*="Stipendio"]', "Stipendio Maggio");
  const amountInput = await page.$('input[type="number"]');
  await amountInput.type("2500");
  await shot(page, "06-form-filled.png");

  await browser.close();
  console.log("\nAll screenshots saved to public/screenshots/");
})();
