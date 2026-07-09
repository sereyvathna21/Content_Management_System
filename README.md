<div align="center">

# NSPC CMS

**A Modern Content Management System for the National Social Protection Council**

[![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started (Docker — Recommended)](#getting-started-docker--recommended)
- [Getting Started (Manual Setup)](#getting-started-manual-setup)
- [Environment Variables Reference](#environment-variables-reference)
- [Configuring Third-Party Services](#configuring-third-party-services)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

NSPC CMS is a full-stack content management platform built to manage news articles, publications, laws & regulations, social content, media, and more. It is composed of three independent applications that communicate through a shared REST API and real-time SignalR connections.

| Application | Description | Port |
| :--- | :--- | :---: |
| **Backend API** | .NET 10 Web API with JWT authentication, role-based access control, audit logging, and Telegram integration | `5001` |
| **Admin Dashboard** | Next.js 16 internal admin panel for content management, user management, and analytics | `3001` |
| **Frontend Website** | Next.js 16 public-facing website with i18n support and SSR | `3000` |

---

## Architecture

```text
┌─────────────┐     ┌─────────────┐
│   Frontend   │     │    Admin     │
│  (Next.js)   │     │  (Next.js)   │
│  Port: 3000  │     │  Port: 3001  │
└──────┬───────┘     └──────┬───────┘
       │    REST / SignalR   │
       └────────┬────────────┘
                ▼
        ┌───────────────┐
        │  Backend API   │
        │   (.NET 10)    │
        │  Port: 5001    │
        └──┬─────────┬──┘
           │         │
     ┌─────▼──┐  ┌───▼────┐
     │PostgreSQL│  │ Redis  │
     │Port:5432│  │Port:6379│
     └────────┘  └────────┘
```

---

## Prerequisites

### Option A — Docker (Recommended)

Only two things are needed:

| Tool | Version | Download |
| :--- | :--- | :--- |
| **Docker Desktop** | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Git** | Any | [git-scm.com](https://git-scm.com/) |

> **That's it.** Docker will handle PostgreSQL, Redis, .NET, and Node.js automatically.

### Option B — Manual (Without Docker)

You must install **all** of the following on your machine:

| Tool | Version | Download |
| :--- | :--- | :--- |
| **Git** | Any | [git-scm.com](https://git-scm.com/) |
| **.NET SDK** | 10.0+ | [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download/dotnet/10.0) |
| **Node.js** | 18+ (LTS recommended) | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL** | 16+ | [postgresql.org/download](https://www.postgresql.org/download/) |
| **Redis** | 7+ | [redis.io/docs/install](https://redis.io/docs/install/install-redis/) |

> **Windows users:** Redis does not natively support Windows. Use [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) or [Memurai](https://www.memurai.com/) as an alternative.

---

## Getting Started (Docker — Recommended)

With Docker, the entire platform is up and running in **three commands**.

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "NSPC CMS"
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open the `.env` file and replace the placeholder values with your own. See the [Environment Variables Reference](#environment-variables-reference) section below for details on each variable.

### 3. Build & Start

```bash
docker-compose up -d --build
```

This single command will:
- Pull and start **PostgreSQL 16** and **Redis 7** containers.
- Build and start the **.NET Backend API**.
- Build and start both **Next.js** applications (Admin & Frontend).
- Start **Adminer** (a lightweight database management GUI).
- Automatically run database migrations and seed initial data.

### 4. Access the Applications

Once the containers are healthy, open your browser:

| Service | URL |
| :--- | :--- |
| 🌐 Frontend Website | [http://localhost:3000](http://localhost:3000) |
| 🛡️ Admin Dashboard | [http://localhost:3001](http://localhost:3001) |
| ⚙️ Backend API (Swagger) | [http://localhost:5001](http://localhost:5001) |
| 🗄️ Adminer (Database GUI) | [http://localhost:8080](http://localhost:8080) |

> **Adminer login:** System = `PostgreSQL`, Server = `db`, Username = `nspc`, Password = *(your POSTGRES_PASSWORD from `.env`)*, Database = `nspc`.

### Stopping & Restarting

```bash
# Stop all containers (preserves data)
docker-compose stop

# Restart all containers
docker-compose start

# Stop and remove containers (data in volumes is preserved)
docker-compose down

# Stop, remove containers, AND delete all data (fresh start)
docker-compose down -v
```

---

## Getting Started (Manual Setup)

Follow these steps **in order** if you are not using Docker.

### Step 1 — Set Up PostgreSQL

1. Install PostgreSQL and ensure the service is running.
2. Create a new database and user:

```sql
CREATE USER nspc WITH PASSWORD 'your_secure_password';
CREATE DATABASE nspc OWNER nspc;
```

### Step 2 — Set Up Redis

1. Install Redis and ensure the service is running on the default port (`6379`).
2. Verify with: `redis-cli ping` — you should see `PONG`.

### Step 3 — Backend API

```bash
cd Backend

# Copy the example configuration and fill in your values
cp appsettings.example.json appsettings.json
```

Open `appsettings.json` and update the following:

- `ConnectionStrings.DefaultConnection` — set your PostgreSQL host, port, username, and password.
- `ConnectionStrings.RedisConnection` — set your Redis host (default: `localhost:6379`).
- `Jwt.Secret` — set a strong random string (minimum 32 characters).
- `Email.*` — configure SMTP credentials (see [Email Configuration](#email-smtp)).
- `Telegram.*` — configure Telegram bot (see [Telegram Bot](#telegram-bot)).

Then run:

```bash
# Apply database migrations
dotnet ef database update

# Start the API server
dotnet run
```

The API will be available at `http://localhost:5001`. In development mode, Swagger UI is available at the same URL.

### Step 4 — Admin Dashboard

```bash
cd Admin

# Copy the example environment file
cp .env.example .env.local
```

Update `.env.local`:

| Variable | Value |
| :--- | :--- |
| `NEXTAUTH_SECRET` | A strong random string for session encryption |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:5001` |

Then run:

```bash
npm install
npm run dev
```

The Admin Dashboard will be available at `http://localhost:3001`.

### Step 5 — Frontend Website

```bash
cd Frontend

# Copy the example environment file
cp .env.example .env.local
```

Update `.env.local`:

| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5001` |
| `REVALIDATE_SECRET` | Must match the `RevalidateSecret` value in `Backend/appsettings.json` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Your Google reCAPTCHA v2 site key |

Then run:

```bash
npm install
npm run dev
```

The Frontend Website will be available at `http://localhost:3000`.

---

## Environment Variables Reference

### Root `.env` (Used by Docker Compose)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `POSTGRES_DB` | PostgreSQL database name | `nspc` |
| `POSTGRES_USER` | PostgreSQL username | `nspc` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `change_me` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `change_me` |
| `JWT_ISSUER` | JWT token issuer | `NSPCBackend` |
| `JWT_AUDIENCE` | JWT token audience | `NSPCAdmin` |
| `AUTH_SECRET` | Next.js Auth session secret | `change_me` |
| `EMAIL_SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_SMTP_PORT` | SMTP server port | `587` |
| `EMAIL_SMTP_USER` | SMTP login email | — |
| `EMAIL_SMTP_PASSWORD` | SMTP login password / app password | — |
| `EMAIL_FROM_NAME` | Display name on outgoing emails | `NSPC CMS` |
| `EMAIL_FROM_ADDRESS` | Sender email address | — |
| `EMAIL_REPLY_TO` | Reply-to email address | — |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | — |
| `TELEGRAM_CHANNEL_ID` | Telegram channel identifier | — |

> ⚠️ **Security:** Never commit your `.env` file. The `.gitignore` is pre-configured to exclude it.

---

## Configuring Third-Party Services

### Email (SMTP)

The platform uses SMTP to send password reset emails, OTP codes, and system notifications.

**Using Gmail:**
1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account.
2. Generate an [App Password](https://myaccount.google.com/apppasswords) (select "Mail" as the app).
3. Set the following in your `.env` (Docker) or `Backend/appsettings.json` (manual):

| Setting | Value |
| :--- | :--- |
| SMTP Host | `smtp.gmail.com` |
| SMTP Port | `587` |
| SMTP User | Your Gmail address |
| SMTP Password | The 16-character App Password |

**Using other providers** (SendGrid, Mailgun, etc.): update the host, port, and credentials accordingly.

### Telegram Bot

The platform can publish content directly to a Telegram channel and receive delivery confirmations.

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to create a new bot.
3. Copy the **API token** you receive — this is your `TELEGRAM_BOT_TOKEN`.
4. Create a public Telegram channel (or use an existing one).
5. Add your bot as an **administrator** of the channel.
6. Set `TELEGRAM_CHANNEL_ID` to the channel username (e.g., `@your_channel`).

### Google reCAPTCHA

The frontend uses Google reCAPTCHA v2 to protect public forms.

1. Visit [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
2. Register a new site with reCAPTCHA v2 ("I'm not a robot" checkbox).
3. Add your domains (e.g., `localhost`, `yourdomain.com`).
4. Set the **Site Key** in `Frontend/.env.local` as `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
5. Set the **Secret Key** in `Backend/appsettings.json` under `Recaptcha.SecretKey`.

---

## Project Structure

```text
NSPC CMS/
│
├── Backend/                        # .NET 10 Web API
│   ├── Controllers/                # API endpoints (Auth, News, Laws, etc.)
│   ├── Models/                     # Entity models
│   ├── DTOs/                       # Data transfer objects
│   ├── Services/                   # Business logic layer
│   ├── Database/                   # DbContext and configurations
│   ├── Migrations/                 # EF Core database migrations
│   ├── Security/                   # Authorization policies & handlers
│   ├── Hubs/                       # SignalR hubs (notifications, contacts)
│   ├── Helpers/                    # Utility classes
│   ├── Mappings/                   # AutoMapper profiles
│   ├── appsettings.example.json    # Configuration template
│   └── Dockerfile.dev              # Development container image
│
├── Admin/                          # Next.js 16 Admin Dashboard
│   ├── src/                        # Application source code
│   ├── messages/                   # i18n translation files
│   ├── .env.example                # Environment template
│   └── Dockerfile.dev              # Development container image
│
├── Frontend/                       # Next.js 16 Public Website
│   ├── app/                        # Next.js App Router pages
│   ├── messages/                   # i18n translation files
│   ├── .env.example                # Environment template
│   └── Dockerfile.dev              # Development container image
│
├── docs/                           # Internal documentation & implementation plans
├── docker-compose.yml              # Multi-container orchestration
├── .env.example                    # Root environment template
├── .gitignore                      # Version control exclusions
└── NSPC CMS.sln                    # .NET solution file
```

---

## API Documentation

When running in **Development** mode, the Backend API exposes interactive documentation via Swagger UI:

- **Swagger UI:** [http://localhost:5001](http://localhost:5001)
- **OpenAPI Spec:** [http://localhost:5001/openapi/v1.json](http://localhost:5001/openapi/v1.json)

All API endpoints require JWT authentication (via `Authorization: Bearer <token>`) except for public endpoints prefixed with `/api/public/`.

---

## Available Scripts

### Docker

| Command | Description |
| :--- | :--- |
| `docker-compose up -d --build` | Build and start all services in the background |
| `docker-compose stop` | Stop all services (preserves data) |
| `docker-compose down` | Stop and remove containers |
| `docker-compose down -v` | Stop, remove containers, and delete all data |
| `docker-compose logs -f backend` | Follow the Backend logs in real time |
| `docker-compose logs -f admin` | Follow the Admin Dashboard logs in real time |
| `docker-compose logs -f frontend` | Follow the Frontend Website logs in real time |

### Backend (.NET)

| Command | Description |
| :--- | :--- |
| `dotnet run` | Start the API in development mode |
| `dotnet build` | Compile the project |
| `dotnet ef database update` | Apply pending database migrations |
| `dotnet ef migrations add <Name>` | Create a new migration |

### Frontend & Admin (Next.js)

| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint code analysis |

---

## Troubleshooting

<details>
<summary><strong>Docker: Port already in use</strong></summary>

If you see `bind: address already in use`, another process is using the port. Find and stop it:

```bash
# macOS / Linux
lsof -i :5001   # Replace with the conflicting port
kill -9 <PID>

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

</details>

<details>
<summary><strong>Docker: Database connection refused</strong></summary>

The `backend` container may start before PostgreSQL is fully ready. Restart just the backend:

```bash
docker-compose restart backend
```

</details>

<details>
<summary><strong>Manual: "dotnet ef" command not found</strong></summary>

Install the Entity Framework CLI tool globally:

```bash
dotnet tool install --global dotnet-ef
```

</details>

<details>
<summary><strong>Manual: Redis connection error</strong></summary>

Ensure Redis is installed and running:

```bash
# macOS (Homebrew)
brew services start redis

# Linux (systemd)
sudo systemctl start redis

# Verify
redis-cli ping   # Should return: PONG
```

</details>

<details>
<summary><strong>Frontend/Admin: Module not found errors</strong></summary>

Clear the dependency cache and reinstall:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

</details>

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "feat: add your feature"`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a Pull Request.

Please follow the existing code style and include relevant tests where applicable.

---

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

---

<div align="center">

**Built with ❤️ by the NSPC Development Team**

</div>
