"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const getCategories_1 = require("./scripts/getCategories");
const getCategoryBook_1 = require("./scripts/getCategoryBook");
const buyBook_1 = require("./scripts/buyBook");
const PORT = 3001;
const app = (0, express_1.default)();
const http = new http_1.Server(app);
const socket = new socket_io_1.Server(http, {
    cors: {
        origin: "*",
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
socket.on("connection", async (io) => {
    try {
        let browser = await puppeteer_1.default.launch();
        let page = await browser.newPage();
        let categories;
        io.emit("loaded");
        io.on("getCategories", async () => {
            categories = [...(await (0, getCategories_1.getCategories)(browser, io, page).catch())];
        });
        io.on("getCategoryBook", async (userCategory) => {
            await (0, getCategoryBook_1.getCategoryBook)(io, browser, page, categories, userCategory).catch();
        });
        io.on("buyBook", async (bookName) => {
            await (0, buyBook_1.buyBook)(io, browser, page, bookName).catch();
        });
    }
    catch {
        io.emit("error", "Browser error");
    }
});
process.on("unhandledRejection", (error) => {
    console.log("unhandledRejection", error);
});
http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
