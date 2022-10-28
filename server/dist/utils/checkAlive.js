"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAlive = void 0;
const checkAlive = async (browser, page) => (await browser.pages()).length === 0 || page.isClosed();
exports.checkAlive = checkAlive;
