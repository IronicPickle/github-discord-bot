import {
  CreateSlashApplicationCommand,
  DiscordChannel,
  DiscordInteractionDataOption,
  DiscordMember,
  DiscordRole,
  Interaction,
  InteractionResponseTypes,
  InteractionTypes,
} from "../../deps/discordeno.ts";
import { toCamelCase } from "../../lib/utils/generic.ts";
import { bot, botEventManager } from "../setupBot.ts";
import addUpdateRepository from "./addUpdateRepository.ts";
import removeUpdateRepository from "./removeUpdateRepository.ts";
import setUpdateChannel from "./setUpdateChannel.ts";

export default () => {
  setUpdateChannel();
  addUpdateRepository();
  removeUpdateRepository();
};

export const createGlobalCommand = (
  name: string,
  command: Omit<CreateSlashApplicationCommand, "name">,
  handler: (interaction: Interaction) => Promise<string | undefined>
) => {
  bot.helpers.createGlobalApplicationCommand({
    name,
    ...command,
  });

  botEventManager.addEventListener(
    "interactionCreate",
    async (_bot, interaction) => {
      if (
        interaction.type === InteractionTypes.ApplicationCommand &&
        interaction.data?.name === name
      ) {
        const msg = await handler(interaction);
        if (msg) {
          bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: {
                content: msg,
              },
            }
          );
        }
      }
    }
  );
};

export const parseOptions = <R extends string, P extends string>(
  options: DiscordInteractionDataOption[]
) => {
  const parsedOptions = {} as Record<string, any>;

  for (const option of options) {
    parsedOptions[toCamelCase(option.name)] = option;
  }

  return parsedOptions as CommandOptions<R, P>;
};

export const extractValues = <R extends string, P extends string>(
  options: CommandOptions<R, P>
) => {
  const extractedValues = {} as Record<string, any>;

  for (const [name, option] of Object.entries(options) as any) {
    extractedValues[name] = option.value;
  }

  return extractedValues as CommandValues<R, P>;
};

export type CommandOptions<R extends string, P extends string> = Required<
  MappedCommandOptions<R>
> &
  Partial<MappedCommandOptions<P>>;

export type MappedCommandOptions<O extends string> = {
  [key in O]: DiscordInteractionDataOption;
};

export type CommandValues<R extends string, P extends string> = Required<
  MappedCommandValues<R>
> &
  Partial<MappedCommandValues<P>>;

export type MappedCommandValues<O extends string> = {
  [key in O]:
    | string
    | number
    | boolean
    | DiscordMember
    | DiscordChannel
    | DiscordRole;
};
