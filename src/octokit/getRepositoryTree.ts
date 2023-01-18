import { Octokit } from "../deps/octokit.ts";
import getRepositoryBranch from "./getRepositoryBranch.ts";

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

  const { data: branch, error: branchError } = await getRepositoryBranch(
    name,
    ownerName,
    branchName,
    accessToken
  );

  if (branchError || !branch) return { error: branchError };

  try {
    const { data } = await octokit.rest.git.getTree({
      repo: name,
      owner: ownerName,
      tree_sha: branch.commit.commit.tree.sha,
      recursive: "true",
    });

    return { data };
  } catch (err) {
    return { error: `${err}` };
  }
};
