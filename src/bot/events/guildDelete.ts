import { log } from "../../lib/utils/generic.ts";
import { botEventManager } from "../setupBot.ts";

export default () => {
  botEventManager.addEventListener("guildDelete", (_bot, id) => {
    log(`Bot left guild ${id}.`);
  });
};
