"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const constants_1 = __importDefault(require("../constants/constants"));
const checkAlive_1 = require("../utils/checkAlive");
const getCategories = (browser, io, page) => new Promise(async (resolve, reject) => {
    try {
        if (await (0, checkAlive_1.checkAlive)(browser, page)) {
            return reject();
        }
        await page.goto("https://www.goodreads.com/choiceawards/best-books-2020", {
            waitUntil: "networkidle2",
        });
        await page.waitForSelector(constants_1.default.CATEGORY_SELECTOR);
        const categories = await page.evaluate((categorySelector) => {
            return [...document.querySelectorAll(categorySelector)].map((category) => category.textContent?.trim());
        }, constants_1.default.CATEGORY_SELECTOR);
        io.emit("categories", categories);
        resolve(categories);
    }
    catch {
        io.emit("error", "Can't get categories");
        reject();
    }
});
exports.getCategories = getCategories;
