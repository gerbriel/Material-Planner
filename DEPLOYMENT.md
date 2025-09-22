# Deploying to GitHub Pages

This project is configured to deploy to GitHub Pages using GitHub Actions.

## One-time setup

1. Create a GitHub repository and push your code:
   - Add the remote: `git remote add origin https://github.com/<USER>/<REPO>.git`
   - Push: `git push -u origin main`

2. In your repository settings on GitHub:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions" (it will auto-detect the workflow)

## Base path

The build workflow automatically sets the Vite `--base` to:
- `/` when the repo name ends with `.github.io` (user/organization site)
- `/<REPO>/` for project sites

No manual changes to `vite.config.ts` are required.

## Deploy

Whenever you push to `main`, the workflow will:
- Install dependencies
- Build the site with the correct base
- Publish the `dist` folder to GitHub Pages

You can also trigger a manual deploy via the Actions tab ("Run workflow").

## Preview locally

```
npm run build
npm run preview
```

Open http://localhost:4173.
