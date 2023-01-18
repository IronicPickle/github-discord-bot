import { ApplicationCommandOptionTypes } from "../../deps/discordeno.ts";
import { botConfigManager } from "../../index.ts";
import { createGlobalCommand } from "./setupCommands.ts";

export default () => {
  createGlobalCommand(
    "set-update-channel",
    {
      description: "Set the channel to be used to broadcast updates.",
      options: [
        {
          type: ApplicationCommandOptionTypes.Channel,
          name: "channel",
          description: "The channel to be used.",
          required: true,
        },
      ],
    },
    async (interaction) => {
      const { data, guildId } = interaction;
      const { options = [] } = data ?? {};
      const [channel] = options;

      const updateChannelId = channel?.value?.toString();

      if (!updateChannelId || !guildId) return;

      const botConfig = botConfigManager.getGuildConfig(guildId);
      if (!botConfig) return "No config found for guild.";

      botConfig.updateChannelId = updateChannelId;
      botConfigManager.updateGuildConfig(guildId, botConfig);

      return `Github updates will now be broadcast to <#${updateChannelId}>.`;
    }
  );
};
