import commandLineArgs from "command-line-args";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import pino from "pino";
import PinoPretty from "pino-pretty";
import { addSeason } from "./src/season";
import SonarrClient from "./src/sonarr";
dotenv.config();
export const logger = pino(PinoPretty());

// take login and password from env and convert it to base64
export const BASIC_AUTH_HEADER =
  "Basic " +
  Buffer.from(
    `${process.env.BASIC_AUTH_USERNAME}:${process.env.BASIC_AUTH_PASSWORD}`
  ).toString("base64");
logger.info("Basic auth header: " + BASIC_AUTH_HEADER);

const optionDefinitions = [
  { name: "action", alias: "a", type: String },
  { name: "season", alias: "s", type: String },
];
export const sonarrClient = new SonarrClient();
const options = commandLineArgs(optionDefinitions);

if (options.action === "add") {
  logger.info("Adding" + options.season + " season to sonarr");
  addSeason(options.season);
}
