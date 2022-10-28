import { Browser, Page } from "puppeteer";

export const checkAlive = async (browser: Browser, page: Page) =>
  (await browser.pages()).length === 0 || page.isClosed();
