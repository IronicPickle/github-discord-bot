import config from "../config/config.ts";
import push from "./github/push.ts";
import { Application, Router, RouterContext } from "../deps/oak.ts";
import { log } from "../lib/utils/generic.ts";

export const app = new Application();
export const router = new Router();

export default () => {
  push();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ port }) => {
    log("[Oak]", `Listening on ${port}`);
  });

  app.listen(config.oak.listenOptions);
};

export const parseBody = async <B>(ctx: RouterContext<any, any, any>) => {
  let body: B | null;
  try {
    body = await ctx.request.body({
      type: "json",
    }).value;
  } catch (_err) {
    return null;
  }
  return body;
};

export const handleError = (
  ctx: RouterContext<any, any, any>,
  status: number,
  err: string
) => {
  ctx.response.status = status;
  ctx.response.body = { err };
  console.log("[Oak]", `HTTP ERROR | ${status} - ${err}`);
};
