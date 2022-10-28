import { Browser } from "puppeteer";

export const getActivePage = async (browser: Browser) => {
  const pages = await browser.pages();
  let activePage;
  for (let i = 0; i < pages.length; i++) {
    if (await pages[i].evaluate(() => document.visibilityState === "visible")) {
      activePage = pages[i];
    }
  }

  return activePage;
};
