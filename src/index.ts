import * as dotenv from "dotenv";
import * as moment from "moment";
import ChocaBotClient from "./core/base/ChocaBotClient";
import {Logger} from "./utils/logger";
import warn = Logger.warn;

dotenv.config({path: '../.env'});
moment.locale("fr");

export const ChocaBot: ChocaBotClient = new ChocaBotClient(process.env.TOKEN);

process.on("uncaughtException", (err) => warn("Uncaught exception", err));
process.on("unhandledRejection", (err) => warn("Unhandled promise rejection", err));

process.on("SIGINT", () => {
    warn("SIGINT received", "Shutting down...");
    ChocaBot.destroy();
    process.exit();
});
