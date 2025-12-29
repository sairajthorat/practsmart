/**
 * Checks if a public repository exists on GitHub.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<boolean>}
 */
export const checkRepoExists = async (owner, repo) => {
  try {
    const response = await fetch('/api/check-repo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ owner, repo }),
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking GitHub repo:", error);
    return false;
  }
};
