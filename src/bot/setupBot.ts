import config from "../config/config.ts";
import { log } from "../lib/utils/generic.ts";
import BotEventManager from "./BotEventManager.ts";
import setupEvents from "./events/setupEvents.ts";
import setupCommands from "./commands/setupCommands.ts";
import { createBot, Intents, startBot } from "../deps/discordeno.ts";

if (!config.discord.token) throw Error("A discord token is required");

export const bot = createBot({
  token: config.discord.token,
  intents: Intents.Guilds | Intents.GuildMessages,
});

export const botEventManager = new BotEventManager(bot);

export default () => {
  bot.helpers.createGlobalApplicationCommand({
    name: "test",
    description: "Testing",
  });

  botEventManager.addEventListener("ready", (_bot, { user }) =>
    log("[Bot]", `Bot logged in as '${user.username}'`)
  );

  setupEvents();
  setupCommands();

  startBot(bot);
};

//https://discord.com/api/oauth2/authorize?client_id=1062828560332632195&permissions=8&scope=bot
