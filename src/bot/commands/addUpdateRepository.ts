import { ApplicationCommandOptionTypes } from "../../deps/discordeno.ts";
import { botConfigManager } from "../../index.ts";
import { isString } from "../../lib/utils/generic.ts";
import getRepositoryTree from "../../octokit/getRepositoryTree.ts";
import {
  createGlobalCommand,
  extractValues,
  parseOptions,
} from "./setupCommands.ts";

export default async () => {
  await createGlobalCommand(
    "add-update-repository",
    {
      description: "Add a repository to broadcast updates for.",
      defaultMemberPermissions: ["ADMINISTRATOR"],
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: "name",
          description: "The name of the repository to be added.",
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
            "The branch on which to listen to updates. Defaults to 'master'.",
          required: false,
        },
        {
          type: ApplicationCommandOptionTypes.String,
          name: "access-token",
          description:
            "An access token with read access to the repository. (Only relevant if the repository is private)",
          required: false,
        },
      ],
    },
    async (interaction) => {
      const { data, guildId } = interaction;
      const { options = [] } = data ?? {};

      const parsedOptions = parseOptions<
        "name" | "ownerName",
        "branchName" | "accessToken"
      >(options as any);

      const {
        name,
        ownerName,
        branchName = "master",
        accessToken,
      } = extractValues(parsedOptions);

      if (
        !guildId ||
        !isString(name) ||
        !isString(ownerName) ||
        !isString(branchName) ||
        (accessToken != null && !isString(accessToken))
      )
        return "Invalid input";

      const fullName = `${ownerName}/${name}`;

      const botConfig = botConfigManager.getGuildConfig(guildId);
      if (!botConfig) return "No config found for guild.";

      const { data: tree, error: treeError } = await getRepositoryTree(
        name,
        ownerName,
        branchName,
        accessToken
      );

      if (treeError)
        return `Could not fetch or access **${fullName}**.\n> \`${treeError}\``;

      const changelog = tree?.tree.find(({ path }) => {
        return path?.includes("changelog.json");
      });

      const changelogPath = changelog?.path;

      if (!isString(changelogPath))
        return `Could not get **changelog.json** from **${fullName}/${branchName}**.`;

      if (
        botConfig.updateRepositories.find(
          (repository) =>
            repository.name === name &&
            repository.ownerName === ownerName &&
            repository.branchName === branchName
        )
      )
        return `**${fullName}/${branchName}** is already configured.`;

      botConfig.updateRepositories.push({
        name,
        ownerName,
        branchName,
        accessToken,
        changelogPath,
      });

      botConfigManager.updateGuildConfig(guildId, botConfig);

      const webhookUrl = `https://updater.ironicpickle.uk/github/push/${guildId}`;

      return `Listening for updates from **${fullName}/${branchName}**.
Create a webhook on the repository that listens for push events using the following url.
> \`${webhookUrl}\``;
    }
  );
};
