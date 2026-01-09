# Deployment Setup Guide: Vercel + Supabase + GitHub Auth

Since your project uses **Vercel** for hosting (both frontend and serverless backend), **Supabase** for the database/auth, and **GitHub** for login, you need to connect these services correctly.

Follow this step-by-step guide to configure all your URLs.

---

## 1. Deploy to Vercel (First Pass)
If you haven't already deployed, connect your GitHub repository to Vercel.
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** > **Project**.
3. Import your `practsmart` repository.
4. **Build Settings**: Vercel should automatically detect `Vite`.
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.
   - *Note: The build might look successful, but the app won't work yet because Environment Variables are missing. This is normal.*
6. Once deployed, copy your **Vercel Project URL** (e.g., `https://practsmart-xyz.vercel.app`). You will need this for the next steps.

---

## 2. Configure GitHub OAuth App
This allows users to log in with GitHub.

1. Log in to your GitHub account.
2. Go to **Settings** -> **Developer settings** (bottom left) -> **OAuth Apps**.
3. Click **New OAuth App**.
4. Fill in the details:
   - **Application Name**: `PractSmart` (or your preferred name).
   - **Homepage URL**: Your Vercel Project URL (e.g., `https://practsmart-xyz.vercel.app`).
   - **Authorization callback URL**: You need to get this from Supabase (see next step). For now, you can put `https://placeholder.com` and we will update it in a moment.
5. Click **Register application**.
6. Keep this tab open. You will need the **Client ID** and **Client Secret**. (Click "Generate a new client secret" if needed).

---

## 3. Configure Supabase Auth
Connect Supabase to your GitHub App and Vercel.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.

### A. Set up GitHub Provider
1. Go to **Authentication** (icon on left) -> **Providers**.
2. Click **GitHub**.
3. **Enable GitHub**.
4. Copy the **Callback URL** shown at the top (it looks like `https://<project-ref>.supabase.co/auth/v1/callback`).
5. **Go back to your GitHub OAuth App tab** (from Step 2).
   - Update the **Authorization callback URL** with this value.
   - Save changes.
6. **Go back to Supabase**:
   - Paste the **Client ID** from GitHub.
   - Paste the **Client Secret** from GitHub.
   - Click **Save**.

### B. URL Configuration
1. Go to **Authentication** -> **URL Configuration**.
2. **Site URL**: Enter your Vercel Project URL (e.g., `https://practsmart-xyz.vercel.app`).
3. **Redirect URLs**:
   - Add `https://practsmart-xyz.vercel.app/**` (This ensures deep links and auth redirects work on all pages).
   - If you develop locally, make sure `http://localhost:5173/**` is also there.
4. Click **Save**.

---

## 4. Configure Vercel Environment Variables
Now you need to give Vercel the secrets to talk to Supabase and OpenRouter.

1. Go to your **Vercel Project Dashboard**.
2. Click **Settings** -> **Environment Variables**.
3. Add the following variables (copy values from your local `.env` or Supabase/OpenRouter dashboards):

| Variable Name | Value Source | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Settings -> API | Backend URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Settings -> API | Public API Key |
| `OPENROUTER_API_KEY` | OpenRouter Dashboard | For AI Grading |
| `GITHUB_TOKEN` | GitHub Settings | **Personal Access Token (Classic)**. Needed for the backend to fetch student code securely. |

**Important Note on `GITHUB_TOKEN`**:
- This is *not* the OAuth token. This is a Personal Access Token (PAT) used by your *server* to fetch public code from student repos.
- Generate it here: **GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic)**.
- Scopes needed: `repo` (for private repos) or just `public_repo`.

---

## 5. Final Redeploy
1. After adding the Environment Variables in Vercel, you must **Redeploy** for them to take effect.
2. Go to the **Deployments** tab in Vercel.
3. Click the three dots on the latest deployment -> **Redeploy**.

---

## Summary of URLs

| Service | Setting | Value |
| :--- | :--- | :--- |
| **Vercel** | Project Domain | `https://practsmart.vercel.app` (Example) |
| **GitHub OAuth** | Homepage URL | `https://practsmart.vercel.app` |
| **GitHub OAuth** | Callback URL | `https://<supabase-ref>.supabase.co/auth/v1/callback` |
| **Supabase** | Site URL | `https://practsmart.vercel.app` |
| **Supabase** | Redirect URL | `https://practsmart.vercel.app/**` |

Your application should now comprise:
1. **Frontend**: UI deployed on Vercel.
2. **Backend**: Serverless functions running at `/api/*` on the same Vercel domain.
3. **Database/Auth**: Managed by Supabase.
