"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryBook = void 0;
const constants_1 = __importDefault(require("../constants/constants"));
const checkAlive_1 = require("../utils/checkAlive");
const getCategoryBook = (io, browser, page, categories, userCategory) => new Promise(async (resolve, reject) => {
    try {
        if (await (0, checkAlive_1.checkAlive)(browser, page)) {
            return reject();
        }
        await page.evaluate((categorySelector, answer) => {
            document
                .querySelectorAll(categorySelector)[answer].parentElement?.click();
        }, constants_1.default.CATEGORY_SELECTOR, categories.findIndex((category) => category === userCategory));
        const bookTitleSelector = ".winningTitle.choice.gcaBookTitle";
        await page.waitForSelector(bookTitleSelector);
        const bookName = await page.evaluate((bookTitleSelector) => {
            return document.querySelector(bookTitleSelector)?.textContent;
        }, bookTitleSelector);
        await browser.close();
        io.emit("book", bookName);
    }
    catch {
        io.emit("error", "Can't get book");
        reject();
    }
});
exports.getCategoryBook = getCategoryBook;
