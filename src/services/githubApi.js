/**
 * Checks if a public repository exists on GitHub.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<boolean>}
 */
export const checkRepoExists = async (owner, repo) => {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    return response.status === 200;
  } catch (error) {
    console.error("Error checking GitHub repo:", error);
    return false;
  }
};
