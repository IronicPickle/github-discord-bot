import { Config } from "./config.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const config: Config = {
  dataDir: Deno.env.get("DATA_DIR") ?? "/data",
  discord: {
    token: Deno.env.get("DISCORD_TOKEN"),
  },
  oak: {
    listenOptions: {
      port: 8080,
    },
  },
};

export default config;
