import { handleError, parseBody, router } from "../setupOak.ts";
import { WebhookPingEvent } from "../../lib/ts/webhookPingEvent.ts";
import { WebhookPushEvent } from "../../lib/ts/webhookPushEvent.ts";
import { botConfigManager } from "../../index.ts";
import { bot } from "../../bot/setupBot.ts";
import {
  isWebhookPingEvent,
  isWebhookPushEvent,
} from "../../lib/utils/generic.ts";
import getRepositoryContent from "../../octokit/getRepositoryContent.ts";
import dayjs, { Base64 } from "../../deps/deps.ts";
import { Changelog } from "../../lib/ts/generic.ts";

export default () => {
  router.post("/github/push/:guildId", async (ctx) => {
    const body = await parseBody<Partial<WebhookPingEvent | WebhookPushEvent>>(
      ctx
    );

    if (isWebhookPingEvent(body)) return (ctx.response.status = 200);
    else if (isWebhookPushEvent(body)) {
      const { guildId } = ctx.params;
      if (!guildId) return handleError(ctx, 400, "No guild ID.");

      const guildConfig = botConfigManager.getGuildConfig(BigInt(guildId));
      const { updateChannelId, updateRepositories } = guildConfig ?? {};

      if (!guildConfig || !updateChannelId || !updateRepositories)
        return handleError(ctx, 404, "Guild not configured.");

      if (!body) return handleError(ctx, 400, "No body.");
      const { full_name = "" } = body.repository ?? {};
      const { ref = "" } = body ?? {};

      const [ownerName, name] = full_name.split("/");
      const [_refs, _heads, branchName] = ref.split("/");

      if (!ownerName || !name || !branchName)
        return handleError(ctx, 400, "Missing repository details.");

      const repositoryIndex = updateRepositories.findIndex(
        (repository) =>
          repository.name === name &&
          repository.ownerName === ownerName &&
          repository.branchName !== branchName
      );
      const repository = updateRepositories[repositoryIndex];

      if (!repository)
        return handleError(ctx, 404, "Repository not configured for updates.");

      const changelogUpdated = !!body.commits.find(({ added, modified }) =>
        [...added, ...modified].find(
          (path) => path === repository.changelogPath
        )
      );

      if (!changelogUpdated) return (ctx.response.status = 200);

      const { data: content, error: contentError } = await getRepositoryContent(
        name,
        ownerName,
        branchName,
        repository.changelogPath,
        repository.accessToken
      );

      if (!content || contentError)
        return handleError(ctx, 404, "Failed to get changelog.json.");

      let changelog: Changelog = {};
      try {
        const decoded = Base64.fromBase64String(content.content).toString();
        changelog = JSON.parse(decoded);
      } catch (_err) {
        return handleError(ctx, 400, "Failed to parse changelog.json.");
      }

      const changelogArray = Object.entries(changelog)
        .map(([version, { date, changes }]) => ({
          version,
          date: dayjs(date),
          changes,
        }))
        .sort(
          (a, b) =>
            parseInt(b.version.replace(/\./g, "")) -
            parseInt(a.version.replace(/\./g, ""))
        );

      const mostRecentChange = changelogArray[0];

      if (
        !mostRecentChange ||
        repository.lastVersionSeen === mostRecentChange.version
      )
        return (ctx.response.status = 200);

      guildConfig.updateRepositories[repositoryIndex].lastVersionSeen =
        mostRecentChange.version;
      botConfigManager.updateGuildConfig(BigInt(guildId), guildConfig);

      const changesString = mostRecentChange.changes
        .map((change) => `- ${change}`)
        .join("\n");

      const description = `
> **Changes**
${changesString}
`;

      bot.helpers.sendMessage(updateChannelId.toString(), {
        embeds: [
          {
            title: `Version ${mostRecentChange.version} - \`${full_name}\` on \`${branchName}\``,
            description,
            url: body.head_commit.url,
            thumbnail: {
              url: body.repository.owner.avatar_url,
            },
            color: 2123412,
            footer: {
              text: mostRecentChange.date.format("ddd D MMMM YYYY"),
            },
            author: {
              name: body.sender.login,
              url: body.sender.html_url,
              iconUrl: body.sender.avatar_url,
            },
          },
        ],
      });

      ctx.response.status = 200;
    }
  });
};
