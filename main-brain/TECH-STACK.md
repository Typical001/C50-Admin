# Tech stack — Admin CMS

Last consolidated: 2026-11-09. Local source/configuration reviewed; historical test and hosted observations are dated below. This documentation pass did not rerun application tests or inspect live services.

Source: [package.json](../package.json), [package-lock.json](../package-lock.json), [.env.example](../.env.example). Values below are declared manifest ranges, not a claim that every package is used or that every installed version matches. Use the lockfile for reproducible resolution.

## Declared dependencies

| Package | Manifest range |
| --- | --- |
| @supabase/supabase-js | ^2.110.3 |
| @tailwindcss/vite | ^4.3.2 |
| lucide-react | ^1.24.0 |
| react | ^19.2.7 |
| react-dom | ^19.2.7 |
| react-hot-toast | ^2.6.0 |
| react-icons | ^5.7.0 |
| react-router-dom | ^7.18.1 |
| tailwindcss | ^4.3.2 |

## Declared development dependencies

| Package | Manifest range |
| --- | --- |
| @types/node | ^24.13.2 |
| @types/react | ^19.2.17 |
| @types/react-dom | ^19.2.3 |
| @vitejs/plugin-react | ^6.0.3 |
| oxlint | ^1.71.0 |
| typescript | ~6.0.2 |
| vite | ^8.1.1 |

## Commands

Run in this app directory after installing dependencies with `npm ci`.

| Script | Actual command |
| --- | --- |
| npm run dev | vite |
| npm run build | tsc -b && vite build |
| npm run lint | oxlint |
| npm run preview | vite preview |

## Configuration

Browser variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Administrator authority comes from authenticated identity/profile and database policies, never a bundled server secret.

Keep real values in ignored local environment files or the deployment platform. All VITE_/EXPO_PUBLIC_ values are client-visible; no backend secrets belong there. Package installation is not evidence of a configured product feature. See [workflows](WORKFLOWS.md) for release commands and checks.
