import { Octokit } from "../deps/octokit.ts";

export default async (
  name: string,
  ownerName: string,
  branchName: string,
  path: string,
  accessToken?: string
) => {
  const octokit = new Octokit({
    auth: accessToken,
    baseUrl: "https://api.github.com",
  });

  try {
    const { data } = await octokit.rest.repos.getContent({
      repo: name,
      owner: ownerName,
      path: path,
      ref: branchName,
    });

    return { data } as any;
  } catch (err) {
    return { error: `${err}` };
  }
};
