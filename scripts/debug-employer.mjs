import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:4321/portfolio/", { waitUntil: "networkidle" });
const result = await page.evaluate(() => {
  const exp = document.querySelector("#experience .career-item");
  const emp = exp.querySelector(".career-employer");
  return {
    innerHTML: emp?.innerHTML,
    textContent: emp?.textContent,
    dataViewChildren: Array.from(emp?.children ?? []).map((c) => ({
      tag: c.tagName,
      cls: c.className,
      text: c.textContent,
    })),
  };
});
// eslint-disable-next-line no-console
console.log(JSON.stringify(result, null, 2));
await browser.close();
