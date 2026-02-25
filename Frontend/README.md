# NSPC CMS — Frontend (Next.js)

💡 Overview
NSPC CMS (Frontend) is a public-facing Next.js application that serves landing pages, news, videos, publications and laws. It focuses on accessibility, internationalization (Khmer/English), and reusable UI components that consume the NSPC backend APIs.

✨ Features

- 🔐 Authentication integration with backend (token based / session)
- 🌍 Content pages: news, videos, publications, laws
- 🔍 Search & filter utilities for content discovery
- 📄 Pagination, sorting and content cards
- 📱 Responsive layout with accessible components (ARIA-ready)
- ⚡ Production-ready builds and a focus on performance

👩‍💻 Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- next-intl for internationalization
- ESLint
- (Optional) Sentry, analytics integrations

📖 Sources and external APIs

- CMS backend API (configured via `NEXT_PUBLIC_API_URL`)
- Third-party media or analytics providers (set per project)

📦 Getting Started
To get a local copy of this project up and running, follow these steps.

🚀 Prerequisites

- Node.js (v18.x or higher) and npm or yarn
- PostgreSQL or other database only if you run backend components locally

🛠️ Installation
Clone the repository:

```bash
git clone https://github.com/sereyvathna21/Content_Management_System.git
cd Frontend
```

Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Set up environment variables
Create a `.env.local` in the project root and add the following variables (example):

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://api.example.com
# auth
AUTH_SECRET=your_auth_secret
```

Start the development server:

```bash
npm run dev
```

📖 Usage

- Development: `npm run dev` (visit http://localhost:3000)
- Production: `npm run build && npm run start`

✔ Running the Website

- Development mode: `npm run dev`
- Production mode: `npm run build && npm run start`

📃 API Documentation
If the backend provides Swagger/OpenAPI docs, mount them under `/api/docs` on the API host. Frontend consumes the CMS API configured by `NEXT_PUBLIC_API_URL`.

🐛 Issues
If you encounter problems, open an issue with:

- A descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version)

📜 License
Distributed under the MIT License. See the `LICENSE` file for details.

- Use `vitest` + `@testing-library/react` for component/unit tests.
- Add a `test` script and CI to run lint/type-check/tests.

Example install:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```
