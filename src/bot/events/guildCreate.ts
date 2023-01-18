import { botConfigManager } from "../../index.ts";
import { log } from "../../lib/utils/generic.ts";
import { botEventManager } from "../setupBot.ts";

export default () => {
  botEventManager.addEventListener("guildCreate", (_bot, guild) => {
    const guildConfig = botConfigManager.getGuildConfig(guild.id);
    if (guildConfig) return;

    log(
      `Bot joined guild: '${guild.id}' (${guild.name}), generating config...`
    );
    botConfigManager.initGuildConfig(guild.id);
  });
};
