import { Browser, Page } from "puppeteer";
import { Socket } from "socket.io";
import constants from "../constants/constants";
import { checkAlive } from "../utils/checkAlive";

export const getCategoryBook = (
  io: Socket,
  browser: Browser,
  page: Page,
  categories: string[],
  userCategory: string
) =>
  new Promise<void>(async (resolve, reject) => {
    try {
      if (await checkAlive(browser, page)) {
        return reject();
      }
      await page.evaluate(
        (categorySelector, answer) => {
          document
            .querySelectorAll(categorySelector)
            [answer].parentElement?.click();
        },
        constants.CATEGORY_SELECTOR,
        categories.findIndex((category) => category === userCategory)
      );

      const bookTitleSelector = ".winningTitle.choice.gcaBookTitle";
      await page.waitForSelector(bookTitleSelector);
      const bookName = await page.evaluate((bookTitleSelector) => {
        return document.querySelector(bookTitleSelector)?.textContent;
      }, bookTitleSelector);

      await browser.close();

      io.emit("book", bookName);
    } catch {
      io.emit("error", "Can't get book");
      reject();
    }
  });
