import type { RepositoryInfo } from "../data/repository";

const showGitHubWeb = (text: string) =>
  text.toLowerCase().includes(".md") || text.toLowerCase().includes(".markdown");

export const markdownWithRepositoryContext = (input: string, repository?: RepositoryInfo) => {
  // Handle convertion to raw GitHub URL
  input = input.replace(
    /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\s]+)/g,
    function (x, owner, repo, path) {
      return showGitHubWeb(x) ? x : `https://raw.githubusercontent.com/${owner}/${repo}/${path}`;
    },
  );

  // Handle relative links
  if (repository) {
    input = input.replace(/\[.*?\]\([^#](?!.*?:\/\/).*?\)/g, function (x) {
      const showWeb = showGitHubWeb(x);
      return x
        .replace("(/", "(")
        .replace(
          "(",
          `(${showWeb ? `https://github.com` : `https://raw.githubusercontent.com`}/${
            repository.full_name
          }${showWeb ? "/blob" : ""}/${repository.available_version || repository.default_branch}/`,
        );
    });

    // Handle anchor refrences
    input = input.replace(/\[.*\]\(\#.*\)/g, function (x) {
      return x.replace("(#", `(/hacs/repository/${repository.id}#`);
    });

    // Add references to issues and PRs (avoid CSS hex colors and code blocks)
    input = input.replace(
      /(^|[\s])((?:\w[\w-.]+\/\w[\w-.]+)?#[1-9]\d*)\b/g,
      (match, prefix, reference, offset) => {
        const issueNumber = reference.split("#")[1];

        // Skip if it's a valid CSS hex color (only contains 0-9a-f and is 3 or 6 digits)
        if (issueNumber && /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(issueNumber)) {
          // Check if it's in a CSS context
          if (/(?<=color:\s*|background:\s*|border:\s*|:\s*)$/.test(input.substring(0, offset))) {
            return match;
          }
        }

        const fullReference = reference.includes("/")
          ? reference
          : `${repository.full_name}${reference}`;
        const [fullName, issue] = fullReference.split("#");
        return fullName && issue
          ? `${prefix}[${reference}](https://github.com/${fullName}/issues/${issue})`
          : match;
      },
    );
  }
  return input;
};
