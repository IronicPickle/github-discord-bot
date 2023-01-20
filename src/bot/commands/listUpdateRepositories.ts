import { botConfigManager } from "../../index.ts";
import { createGlobalCommand } from "./setupCommands.ts";

export default async () => {
  await createGlobalCommand(
    "list-update-repositories",
    {
      description: "List all the currently configured update repositories.",
      defaultMemberPermissions: ["ADMINISTRATOR"],
    },
    async (interaction) => {
      const { guildId } = interaction;

      if (!guildId) return "Invalid input";

      const botConfig = botConfigManager.getGuildConfig(guildId);
      if (!botConfig) return "No config found for guild.";

      const repositoriesString = botConfig.updateRepositories
        .map(
          ({
            name,
            ownerName,
            branchName,
            changelogPath,
            lastVersionSeen,
            accessToken,
          }) => `\`${ownerName}/${name}/${branchName}\`
\`\`\`Changelog: ${changelogPath}${
            lastVersionSeen ? `\nLatest Version: ${lastVersionSeen}` : ""
          }
${
  accessToken
    ? `Access token: ${accessToken.replace(/(?<=.{15}).*(?=.{4})/g, (string) =>
        "*".repeat(string.length)
      )}`
    : ""
}
\`\`\``
        )
        .join("\n");

      return `**Currently Configured Update Repositories**

${repositoriesString}`;
    }
  );
};
