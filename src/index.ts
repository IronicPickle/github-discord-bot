import config, { env } from "./config/config.ts";
import { log } from "./lib/utils/generic.ts";
import setupBot from "./bot/setupBot.ts";
import setupOak from "./oak/setupOak.ts";
import { path } from "./deps/deps.ts";
import BotConfigManager from "./bot/BotConfigManager.ts";

export const srcDir = path.dirname(path.fromFileUrl(import.meta.url));
export const dataDir = path.join(srcDir, config.dataDir);

export const botConfigManager = new BotConfigManager();

const start = () => {
  log("Deno Version", "-", Deno.version);
  log("Starting server", "-", env.toUpperCase());
  log(config);

  setupBot();
  setupOak();
};

start();
