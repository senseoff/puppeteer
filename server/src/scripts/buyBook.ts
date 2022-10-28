import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { Socket } from "socket.io";
import { getActivePage } from "../utils/getActivePage";

export const buyBook = (
  io: Socket,
  browser: Browser,
  page: Page,
  bookName: string
) =>
  new Promise<void>(async (resolve, reject) => {
    try {
      const browserURL = "http://127.0.0.1:9222";
      browser = await puppeteer.connect({ browserURL });

      const clientPage = await getActivePage(browser);

      page = await browser.newPage();

      await page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      });

      await clientPage.bringToFront();

      await page.goto("https://www.amazon.com/", {
        waitUntil: "networkidle2",
      });

      try {
        await page.waitForSelector("#twotabsearchtextbox");
        await page.type("#twotabsearchtextbox", bookName);
        await page.keyboard.press("Enter");

        await page.waitForSelector(".a-link-normal.s-no-outline");
        await page.click(".a-link-normal.s-no-outline");
      } catch {
        io.emit("error", "Can't find input");
        return reject();
      }

      const checkLoginOrCheckout = () =>
        new Promise<void>(async (resolve, reject) => {
          try {
            try {
              await page.waitForSelector('[name="signIn"]', { timeout: 2000 });
              io.emit("login");
            } catch {}

            await Promise.race([
              page.waitForSelector(".pmts-indiv-issuer-image"),
              page.waitForSelector("#shipaddress"),
            ]);
            io.emit("bought");
            resolve();
          } catch {
            io.emit("error", "Unable checkout");
            return reject();
          }
        });

      const addToCartBtn = new Promise<void>(async (resolve, reject) => {
        try {
          await page.waitForSelector(".a-button-inner #add-to-cart-button");
          await page.click(".a-button-inner #add-to-cart-button");
          await page.waitForSelector("#nav-cart");
          await page.click("#nav-cart");
          await page.waitForSelector('[name="proceedToRetailCheckout"]');
          await page.click('[name="proceedToRetailCheckout"]');
          await checkLoginOrCheckout();
          resolve();
        } catch {
          reject();
        }
      });

      const clickOneClickBtn = new Promise<void>(async (resolve, reject) => {
        try {
          await page.waitForSelector("#buybox");
          const accordion = (
            await page.$x('//*[@id="buybox"]/div[2]/div/label/div/a')
          )[0];
          await (accordion as ElementHandle<HTMLElement>).click();
          await page.evaluate(() => {
            (
              document.querySelector(
                "#buybox .a-button-oneclick .a-button-input"
              ) as HTMLElement
            ).click();
          });
          await checkLoginOrCheckout();
          resolve();
        } catch {
          reject();
        }
      });

      try {
        await Promise.race([addToCartBtn, clickOneClickBtn]);
      } catch {
        io.emit("error", "Can't find buy button");
        return reject();
      }

      io.emit("bought");
    } catch {
      io.emit("error", "Can't open browser");
      reject();
    }
  });
