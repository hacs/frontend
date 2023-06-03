import { RepositoryInfo } from "../data/repository";

export const markdownWithRepositoryContext = (input: string, repository?: RepositoryInfo) => {
  // Handle convertion to raw GitHub URL
  input = input.replace(/(https:\/\/github\.com\/.*.\/blob*.[^\s]+)/g, function (x) {
    if (x.includes(".md")) {
      return x;
    }
    return x
      .replace("https://github.com/", "https://raw.githubusercontent.com/")
      .replace("/blob/", "/");
  });

  // Handle relative links
  if (repository) {
    input = input.replace(/!\[*.*\]\((?!.*:\/\/).*\/*.*\.\w*\)/g, function (x) {
      return x
        .replace("(/", "(")
        .replace(
          "(",
          `(https://raw.githubusercontent.com/${repository.full_name}/${
            repository.available_version || repository.default_branch
          }/`
        )
        .replace("/blob/", "/");
    });

    // Add references to issues and PRs
    input = input.replace(/(?:\w[\w-.]+\/\w[\w-.]+|\B)#[1-9]\d*\b/g, (reference) => {
      const fullReference = reference.replace(/^#/, `${repository.full_name}#`);
      const [fullName, issue] = fullReference.split("#");
      return `[${reference}](https://github.com/${fullName}/issues/${issue})`;
    });
  }

  // Shorten commits links
  input = input.replace(
    /[^(]https:\/\/github\.com\/\S*\/commit\/([0-9a-f]{40})/g,
    (url, commit) => {
      const hash = commit.substr(0, 7);
      return `[\`${hash}\`](${url})`;
    }
  );
  return input;
};
