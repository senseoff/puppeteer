import { Browser, Page } from "puppeteer";
import { Socket } from "socket.io";
import constants from "../constants/constants";
import { checkAlive } from "../utils/checkAlive";

export const getCategories = (browser: Browser, io: Socket, page: Page) =>
  new Promise<string[]>(async (resolve, reject) => {
    try {
      if (await checkAlive(browser, page)) {
        return reject();
      }

      await page.goto(
        "https://www.goodreads.com/choiceawards/best-books-2020",
        {
          waitUntil: "networkidle2",
        }
      );

      await page.waitForSelector(constants.CATEGORY_SELECTOR);
      const categories = await page.evaluate((categorySelector) => {
        return [...document.querySelectorAll(categorySelector)].map(
          (category) => category.textContent?.trim()
        );
      }, constants.CATEGORY_SELECTOR);

      io.emit("categories", categories);
      resolve(categories);
    } catch {
      io.emit("error", "Can't get categories");
      reject();
    }
  });
