
const axios = require("axios");

const createGitHubIssue = async (title, description, priority = "normal") => {
  if (
    !process.env.GITHUB_TOKEN ||
    !process.env.GITHUB_OWNER ||
    !process.env.GITHUB_REPO
  ) {
    console.log("GitHub issue creation skipped: missing env variables");
    return null;
  }

  const response = await axios.post(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
    {
      title,
      body: `
Priority: ${priority}

Description:
${description}
      `,
      labels: ["support-ticket", priority],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  return response.data;
};

module.exports = {
  createGitHubIssue,
};