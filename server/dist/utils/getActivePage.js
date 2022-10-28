"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePage = void 0;
const getActivePage = async (browser) => {
    const pages = await browser.pages();
    let activePage;
    for (let i = 0; i < pages.length; i++) {
        if (await pages[i].evaluate(() => document.visibilityState === "visible")) {
            activePage = pages[i];
        }
    }
    return activePage;
};
exports.getActivePage = getActivePage;
