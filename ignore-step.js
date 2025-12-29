console.log("Checking Vercel Build Ignore Status...");
console.log("VERCEL_GIT_COMMIT_REF:", process.env.VERCEL_GIT_COMMIT_REF);

if (process.env.VERCEL_GIT_COMMIT_REF === 'main') {
  console.log("Branch is main. Proceeding with build (Exit 1).");
  process.exit(1);
} else {
  console.log("Branch is NOT main. Skipping build (Exit 0).");
  process.exit(0);
}
