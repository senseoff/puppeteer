import puppeteer, { ElementHandle } from "puppeteer";
import readline from "readline";

(async () => {
  try {
    let browser = await puppeteer.launch();

    let page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    console.log("Looking for genres...");
    await page.goto("https://www.goodreads.com/choiceawards/best-books-2020", {
      waitUntil: "networkidle2",
    });

    const categorySelector = ".category__copy";
    await page.waitForSelector(categorySelector);
    const categories = await page.evaluate((categorySelector) => {
      return [...document.querySelectorAll(categorySelector)].map((category) =>
        category.textContent?.trim()
      );
    }, categorySelector);

    console.clear();
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let answer: number = 0;
    while (!answer) {
      try {
        answer = await new Promise((resolve, reject) => {
          rl.question("Please select a category:", (answer) => {
            if (+answer < 1 || +answer > categories.length)
              return reject("Wrong Answer!");

            resolve(+answer);
            rl.close();
          });
        });
        console.log(`You chose ${categories[+answer - 1]}`);
      } catch (e) {
        console.log(e);
      }
    }

    console.log("Looking for the best book...");
    await page.evaluate(
      (categorySelector, answer) => {
        document
          .querySelectorAll(categorySelector)
          [answer - 1].parentElement?.click();
      },
      categorySelector,
      answer
    );

    const bookTitleSelector = ".winningTitle.choice.gcaBookTitle";
    await page.waitForSelector(bookTitleSelector);
    const bookName = await page.evaluate((bookTitleSelector) => {
      return document.querySelector(bookTitleSelector)?.textContent;
    }, bookTitleSelector);

    await browser.close();
    if (!bookName) return console.log("Something went wrong :(");

    console.clear();
    console.log("Looking for the book at Amazon...");
    browser = await puppeteer.launch({ headless: false });

    page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    await page.goto("https://www.amazon.com/", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("#twotabsearchtextbox");
    await page.type("#twotabsearchtextbox", bookName);
    await page.keyboard.press("Enter");

    await page.waitForSelector(".a-link-normal.s-no-outline");
    await page.click(".a-link-normal.s-no-outline");

    const clickBuyNowBtn = new Promise<void>(async (resolve, reject) => {
      try {
        await page.waitForSelector("#buy-now-button", { timeout: 2000 });
        await page.click("#buy-now-button");
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
        resolve();
      } catch {
        reject();
      }
    });

    console.log("Trying to buy the book...");
    await Promise.race([clickBuyNowBtn, clickOneClickBtn]);

    console.clear();
    console.log("Success, continue the purchase by yourself :)");
  } catch (e) {
    console.log(e);
  }
})();
