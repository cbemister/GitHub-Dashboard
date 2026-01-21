# GitHub Repository Dashboard

A web application to manage, analyze, and organize your GitHub repositories. Track repository status, identify projects that need attention, and get insights into your codebase portfolio.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57)

## Features

- **Repository Status Tracking** - Automatically classifies repos as active, maintained, stale, abandoned, or archived based on activity
- **Priority Scoring** - Identifies which repositories need attention with weighted scoring algorithm
- **Health Scoring** - Measures overall repository health based on activity, issues, and engagement
- **Repository Analysis** - Visualize language distribution, detect tech stacks, and identify project themes
- **Cleanup Recommendations** - AI-powered suggestions for archiving, deleting, or reviewing repos
- **Auto-Generate Topics** - Automatically generate and apply GitHub topics based on repo analysis
- **Active Projects Dashboard** - Quick access to your most recently active repositories

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

   This creates `github-dashboard.db` in the project root (SQLite, no external database needed).

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

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
- **Database**: [SQLite](https://sqlite.org/) with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) and [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: GitHub OAuth 2.0
- **Styling**: CSS Modules
- **GitHub API**: [@octokit/rest](https://github.com/octokit/rest.js)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Business logic
│   ├── auth/             # Session management
│   ├── db/               # Database schema
│   ├── github/           # GitHub API client
│   ├── analysis/         # Repository analysis
│   └── scoring/          # Priority/health scoring
└── types/                 # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

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
