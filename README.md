# ToolhubAI

ToolhubAI is a web application for discovering and reviewing AI-powered tools. It consists of a Next.js application built with the [T3 Stack](https://create.t3.gg/) and a Python scraper used to populate the database with tool information.

## Repository Layout

- **web/** – Next.js project containing the application source, API routes (tRPC) and Prisma schema.
- **scraper/** – Python scripts for gathering AI tool data from external sources.
- **docker-compose.yml** – Provides a local PostgreSQL instance for development.

## Prerequisites

- [Node.js](https://nodejs.org/) `>=20`
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (for the local database)
- [Python 3](https://www.python.org/) (optional, for running the scraper)

## Getting Started

1. **Install dependencies**
   ```bash
   cd web
   yarn install
   ```
2. **Create an environment file**
   Create a `.env` file inside the `web` directory. Use `web/src/env.js` as a guide for required variables, for example:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/web"
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   # Optional webhook URL for sending user feedback
   ZAPIER_FEEDBACK_WEBHOOK_URL="https://hooks.zapier.com/..."
   # ...other variables defined in web/src/env.js
   ```
3. **Start the database**
   ```bash
   docker-compose up -d      # starts a local Postgres container
   # or
   ./start-database.sh       # inside the web directory
   ```
4. **Run migrations and generate the Prisma client**
   ```bash
   yarn db:push
   yarn db:generate
   ```
5. **Start the development server**
   ```bash
   yarn dev
   ```
   The application will be available at `http://localhost:3000`.

## Running the Scraper

The script in `scraper/find_ai.py` collects AI tools from [theresanaiforthat.com](https://theresanaiforthat.com/) and writes them to `scraper/ai_tools.json`.

```bash
pip install seleniumbase pandas
python scraper/find_ai.py
```

## Clarifying Questions

The search interface now asks short clarifying questions when it is unsure about a query. If similarity confidence is below 50%, a question generated with OpenAI's GPT-4o model appears above the results. Answering it refines the search and improves the tools shown.

## Real-Time Results

Search and conversation flow without interruptions. Results now update live as you refine your query so the page never reloads while chatting with the AI assistant.

## Running Tests

Vitest is used for server-side tests located under `web/src/server/api/routers/__tests__`.

```bash
cd web
yarn test
```

## Additional Resources

- The `web/README.md` file contains information specific to the underlying T3 Stack setup.
- Project guidelines and coding conventions are documented in `.clinerules` and `.github/copilot-instructions.md`.

ToolhubAI is still evolving, so feel free to open issues or pull requests if you run into problems or want to contribute new features.
