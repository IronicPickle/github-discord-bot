import { ApplicationCommandOptionTypes } from "../../deps/discordeno.ts";
import { botConfigManager } from "../../index.ts";
import { isString } from "../../lib/utils/generic.ts";
import {
  createGlobalCommand,
  extractValues,
  parseOptions,
} from "./setupCommands.ts";

export default () => {
  createGlobalCommand(
    "remove-update-repository",
    {
      description: "Remove an update repository.",
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: "name",
          description: "The name of the repository to be removed.",
          required: true,
        },
        {
          type: ApplicationCommandOptionTypes.String,
          name: "owner-name",
          description: "The name of the user that owns the repository.",
          required: true,
        },
        {
          type: ApplicationCommandOptionTypes.String,
          name: "branch-name",
          description:
            "The branch configured for the repository. Defaults to 'master'.",
          required: false,
        },
      ],
    },
    async (interaction) => {
      const { data, guildId } = interaction;
      const { options = [] } = data ?? {};

      const parsedOptions = parseOptions<"name" | "ownerName", "branchName">(
        options as any
      );

      const {
        name,
        ownerName,
        branchName = "master",
      } = extractValues(parsedOptions);

      if (
        !guildId ||
        !isString(name) ||
        !isString(ownerName) ||
        !isString(branchName)
      )
        return "Invalid input";

      const fullName = `${ownerName}/${name}`;

      const botConfig = botConfigManager.getGuildConfig(guildId);
      if (!botConfig) return "No config found for guild.";

      const repositoryIndex = botConfig.updateRepositories.findIndex(
        (repository) =>
          repository.name === name &&
          repository.ownerName === ownerName &&
          repository.branchName === branchName
      );

      if (repositoryIndex < 0) return "Repository not found in config.";

      botConfig.updateRepositories.splice(repositoryIndex, 1);

      botConfigManager.updateGuildConfig(guildId, botConfig);

      return `Stopped listening for updates from **${fullName}/${branchName}**.`;
    }
  );
};
