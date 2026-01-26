## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Structure project CMS

project-root/
├── frontend/ # Next.js Landing Page
│ ├── public/
│ │ ├── images/
│ │ └── favicon.ico
│ ├── src/
│ │ ├── app/ # App Router (Next.js 13+)
│ │ │ ├── page.tsx # Home/Landing page
│ │ │ ├── about/
│ │ │ ├── layout.tsx
│ │ │ └── globals.css
│ │ ├── components/ # Reusable components
│ │ ├── lib/ # Utilities & API clients
│ │ └── types/ # TypeScript types
│ ├── next.config.js
│ └── package.json
│
├── cms/ # Next.js CMS Admin
│ ├── public/
│ ├── src/
│ │ ├── app/
│ │ │ ├── dashboard/
│ │ │ ├── content/
│ │ │ ├── settings/
│ │ │ └── login/
│ │ ├── components/
│ │ └── lib/
│ └── package.json
│
├── backend/ # ASP.NET Core API
│ ├── Controllers/
│ ├── Models/
│ ├── Services/
│ ├── Data/ # EF Core DbContext
│ ├── DTOs/ # Data Transfer Objects
│ ├── Middleware/
│ ├── appsettings.json
│ ├── Program.cs
│ └── backend.csproj
