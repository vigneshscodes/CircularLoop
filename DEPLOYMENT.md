# CircularLoop – Free-tier deployment guide

This guide deploys the database on Neo4j AuraDB Free, the Express API on Render Free Web Service and the React frontend on Vercel Hobby. Free-tier quotas, sleep/pause behavior and service policies can change. This setup is suitable for a student demonstration, not guaranteed uninterrupted production uptime.

## 1. Create and seed Neo4j AuraDB

1. Create an AuraDB Free instance from the Neo4j Aura console.
2. Save the Bolt URI, username and generated password when the instance is created.
3. Open AuraDB Query or Neo4j Browser and keep the database available.
4. On your local project, configure `backend/.env`:

```env
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-generated-password
NEO4J_DATABASE=neo4j
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Run the schema and seed scripts from the backend folder:

```bash
npm install
npm run db:setup
npm run db:seed
```

6. Verify records in Neo4j Browser:

```cypher
MATCH (n) RETURN n LIMIT 100;
MATCH ()-[r]->() RETURN r LIMIT 100;
```

Do not share the Aura password or commit `.env`.

## 2. Push the project to GitHub

Create an empty GitHub repository, then run these commands from the project root:

```bash
git init
git add .
git status
git commit -m "Build CircularLoop full-stack application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/CircularLoop.git
git push -u origin main
```

Before committing, check `git status` and confirm neither `backend/.env` nor `frontend/.env` is staged. The root `.gitignore` and nested ignore files exclude environment files, `node_modules` and build output. Commit `.env.example` files only.

## 3. Deploy backend to Render

1. Sign in to Render and create a **New Web Service**.
2. Connect the GitHub repository.
3. Set **Root Directory** to `backend`.
4. Select the free instance type if offered for the account/region.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `npm start`.
7. Add environment variables in Render's Environment settings:

| Key | Value |
|---|---|
| `NEO4J_URI` | AuraDB URI |
| `NEO4J_USERNAME` | AuraDB username |
| `NEO4J_PASSWORD` | AuraDB password |
| `NEO4J_DATABASE` | `neo4j` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| `NODE_ENV` | `production` |

`PORT` is supplied by Render. Do not manually set a conflicting port.

8. Deploy and copy the service URL, such as `https://circularloop-api.onrender.com`.
9. Test:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

A successful response contains `backend: "ok"` and `database: "connected"`. If the database is disconnected, verify the Aura URI, credentials, database status and network access. Render free services can spin down after inactivity, so the first request may take longer.

## 4. Deploy frontend to Vercel

1. Sign in to Vercel and import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset should be Vite.
4. Set the build command to `npm run build` and output directory to `dist` if Vercel does not detect them automatically.
5. Add environment variable:

```env
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Do not append `/api`; the frontend Axios client adds it.
6. Deploy and copy the Vercel production domain.
7. Return to Render and update `FRONTEND_URL` to the exact Vercel origin. For multiple allowed origins, separate them with commas.
8. Redeploy the backend after changing its environment variables.

## 5. Verify the hosted application

1. Open the Vercel URL.
2. Confirm the dashboard displays live database counts.
3. Explore an item and verify components and materials load.
4. Run lifecycle recommendations.
5. Open Graph Explorer and verify nodes and edges appear.
6. Create a custom action, edit it, then delete it to verify Neo4j persistence.
7. Open `/api/health` on Render and confirm database connectivity.

If the browser reports a CORS error, make sure `FRONTEND_URL` exactly matches the Vercel origin, including `https://` and without a trailing slash, then redeploy the backend.

## 6. Free-tier notes

- Neo4j AuraDB Free has resource and availability limits and may pause inactive instances under its current free-tier policy.
- Render Free Web Services can spin down after inactivity and have usage limits. Cold starts can make the first request slow.
- Vercel Hobby has usage and project limits and is intended for personal/non-commercial usage under its terms.
- Free-tier offerings and policies can change. Review the providers' current dashboards and terms before deployment.
- No free-tier configuration guarantees continuous uptime. Keep a local copy of the project and database seed script.
