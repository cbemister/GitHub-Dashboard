# GitHub Repository Dashboard

A self-contained desktop application to manage, analyze, and organize your GitHub repositories. Track repository status, identify projects that need attention, and get insights into your codebase portfolio.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Electron](https://img.shields.io/badge/Electron-40-47848F)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57)

## Features

- **Repository Status Tracking** - Automatically classifies repos as active, maintained, stale, abandoned, or archived based on activity
- **Priority Scoring** - Identifies which repositories need attention with weighted scoring algorithm
- **Health Scoring** - Measures overall repository health based on activity, issues, and engagement
- **Repository Analysis** - Visualize language distribution, detect tech stacks, and identify project themes
- **Cleanup Recommendations** - AI-powered suggestions for archiving, deleting, or reviewing repos
- **Auto-Generate Topics** - Automatically generate and apply GitHub topics based on repo analysis
- **Active Projects Dashboard** - Quick access to your most recently active repositories
- **Self-Contained Desktop App** - No external database required; all data stored locally with SQLite

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- Node.js 18+
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/github-dashboard.git
   cd github-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   SESSION_SECRET="generate-a-secure-random-string"
   ```

4. **Create a GitHub OAuth App**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Set Authorization callback URL to `http://localhost:3000/api/auth/callback`
   - Copy Client ID and Client Secret to your `.env` file

5. **Initialize the database**
   ```bash
   npm run db:push
   ```

6. **Start the application**

   For development (web mode):
   ```bash
   npm run dev
   ```

   For development (desktop mode):
   ```bash
   npm run electron:dev
   ```

7. **Open the app**

   - Web mode: Visit [http://localhost:3000](http://localhost:3000)
   - Desktop mode: The Electron window opens automatically

## Building for Production

Build the desktop application for your platform:

```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:win    # Windows (NSIS installer + portable)
npm run electron:build:mac    # macOS (DMG + ZIP, x64 + arm64)
npm run electron:build:linux  # Linux (AppImage, DEB, RPM)
```

Built applications are output to the `dist-electron` directory.

## Usage

### Dashboard

The main dashboard shows:
- Total repository count with public/private breakdown
- Status distribution (active, maintained, stale, abandoned, archived)
- Active projects grid with recent updates
- Top priority repositories that need attention

### Repositories

Browse all your repositories with:
- Filter by status, language, visibility
- Search by name or description
- Sort by priority score, health score, stars, or last updated
- View detailed information for each repository

### Analysis

Explore patterns across your repositories:
- **Languages** - Distribution of programming languages
- **Topics** - GitHub topics (with auto-generate feature)
- **Tech Stack** - Detected frameworks, databases, and tools
- **Themes** - Project categories (web apps, CLIs, APIs, etc.)

### Insights

Get AI-powered recommendations:
- Repositories to archive (inactive, low engagement)
- Repositories to review (stale but potentially valuable)
- Repositories to keep (active, healthy)

### Settings

- View your profile
- Generate topics for all repositories
- Sign out

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Desktop**: [Electron 40](https://www.electronjs.org/) for cross-platform desktop support
- **Database**: [SQLite](https://www.sqlite.org/) with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) and [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: GitHub OAuth 2.0
- **Styling**: CSS Modules
- **GitHub API**: [@octokit/rest](https://github.com/octokit/rest.js)

## Data Storage

The application uses SQLite for local data storage:

- **Development**: Database stored at `./github-dashboard.db` in the project root
- **Production (Desktop)**: Database stored in the user's app data directory:
  - Windows: `%APPDATA%/github-dashboard/github-dashboard.db`
  - macOS: `~/Library/Application Support/github-dashboard/github-dashboard.db`
  - Linux: `~/.config/github-dashboard/github-dashboard.db`

SQLite with WAL mode ensures reliable concurrent access and data integrity.

## Project Structure

```
├── electron/                  # Electron main process
│   ├── main.js               # Main process entry point
│   └── preload.js            # Preload script for IPC
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Auth pages (login)
│   │   ├── (dashboard)/     # Protected dashboard pages
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Business logic
│   │   ├── auth/           # Session management
│   │   ├── db/             # Database schema (SQLite)
│   │   ├── github/         # GitHub API client
│   │   ├── analysis/       # Repository analysis
│   │   └── scoring/        # Priority/health scoring
│   └── types/               # TypeScript types
├── drizzle.config.ts         # Drizzle ORM configuration
└── electron-builder.json     # Electron Builder configuration
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build Next.js for production |
| `npm run start` | Start Next.js production server |
| `npm run electron:dev` | Start Electron app in development mode |
| `npm run electron:build` | Build Electron app for current platform |
| `npm run electron:build:win` | Build Electron app for Windows |
| `npm run electron:build:mac` | Build Electron app for macOS |
| `npm run electron:build:linux` | Build Electron app for Linux |
| `npm run db:push` | Push schema to SQLite database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |

## Repository Status Definitions

| Status | Description |
|--------|-------------|
| **Active** | Pushed within the last 7 days |
| **Maintained** | Pushed within the last 30 days |
| **Stale** | No push in 30-90 days |
| **Abandoned** | No push in 90+ days |
| **Archived** | Archived on GitHub |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
