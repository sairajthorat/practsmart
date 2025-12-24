export const validateGithubUrl = (url) => {
  const regex = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
  return regex.test(url);
};

export const parseGithubUrl = (url) => {
  if (!validateGithubUrl(url)) return null;
  const parts = url.split('/');
  return {
    owner: parts[3],
    repo: parts[4],
  };
};
