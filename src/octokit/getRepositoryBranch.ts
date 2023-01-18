import { Octokit } from "../deps/octokit.ts";

export default async (
  name: string,
  ownerName: string,
  branchName: string,
  accessToken?: string
) => {
  const octokit = new Octokit({
    auth: accessToken,
    baseUrl: "https://api.github.com",
  });

  try {
    const { data } = await octokit.rest.repos.getBranch({
      repo: name,
      owner: ownerName,
      branch: branchName,
    });

    return { data };
  } catch (err) {
    return { error: `${err}` };
  }
};
