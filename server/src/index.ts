import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import { Socket, Server as SocketServer } from "socket.io";
import { Server } from "http";
import { getCategories } from "./scripts/getCategories";
import { getCategoryBook } from "./scripts/getCategoryBook";
import { buyBook } from "./scripts/buyBook";

const PORT = 3001;
const app = express();
const http = new Server(app);
const socket = new SocketServer(http, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

socket.on("connection", async (io: Socket) => {
  try {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    let categories: string[];

    io.emit("loaded");

    io.on("getCategories", async () => {
      categories = [...(await getCategories(browser, io, page).catch())];
    });

    io.on("getCategoryBook", async (userCategory: string) => {
      await getCategoryBook(
        io,
        browser,
        page,
        categories,
        userCategory
      ).catch();
    });

    io.on("buyBook", async (bookName) => {
      await buyBook(io, browser, page, bookName).catch();
    });
  } catch {
    io.emit("error", "Browser error");
  }
});

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
