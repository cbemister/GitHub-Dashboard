# GitHub Repository Dashboard

A desktop application to manage, analyze, and organize your GitHub repositories. Track repository status, identify projects that need attention, and get insights into your codebase portfolio.

![Electron](https://img.shields.io/badge/Electron-33-47848F)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57)
![React](https://img.shields.io/badge/React-19-61DAFB)

## Features

- **Repository Status Tracking** - Automatically classifies repos as active, maintained, stale, abandoned, or archived based on activity
- **Priority Scoring** - Identifies which repositories need attention with weighted scoring algorithm
- **Health Scoring** - Measures overall repository health based on activity, issues, and engagement
- **Repository Analysis** - Visualize language distribution and status breakdown
- **Cleanup Recommendations** - AI-powered suggestions for archiving, deleting, or reviewing repos
- **Local Data Storage** - All data stored locally in SQLite, no external database required
- **Cross-Platform** - Works on Windows, macOS, and Linux

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token

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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Create a GitHub Personal Access Token**
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select the `repo` scope for full repository access
   - Copy the token and use it to sign in to the app

## Usage

### Login

Enter your GitHub Personal Access Token to authenticate. The token is stored securely in the local SQLite database.

### Dashboard

The main dashboard shows:
- Total repository count with status breakdown
- Active, stale, and abandoned repository counts
- Total stars and open issues
- Recently updated repositories

Click "Sync Repositories" to fetch your latest repositories from GitHub.

### Repositories

Browse all your repositories with:
- Filter by status (active, maintained, stale, abandoned, archived)
- Filter by programming language
- Search by name or description
- View priority and health scores

### Analysis

Explore patterns across your repositories:
- Language distribution chart
- Status distribution chart
- Summary statistics
- Top repositories by stars

### Insights

Get recommendations for repository cleanup:
- Repositories to archive (inactive, low engagement)
- Repositories to review (stale but potentially valuable)
- Repositories to delete (abandoned forks with no stars)

### Issues

View open issues across all your repositories:
- Filter by created/assigned to you
- Quick links to GitHub

### Settings

- View account information
- Export your data as JSON
- Clear all synced data
- View app version info
- Sign out

## Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) 33
- **UI**: [React](https://reactjs.org/) 19 with [React Router](https://reactrouter.com/)
- **Build Tool**: [Vite](https://vitejs.dev/) with vite-plugin-electron
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Styling**: CSS Modules with CSS Variables
- **GitHub API**: [@octokit/rest](https://github.com/octokit/rest.js)

## Project Structure

```
├── electron/                # Electron main process
│   ├── main.ts             # Main entry point
│   ├── preload.ts          # Context bridge (IPC)
│   └── database.ts         # SQLite initialization
├── src/
│   ├── App.tsx             # Main React app with routing
│   ├── main.tsx            # React entry point
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Repositories.tsx
│   │   ├── RepositoryDetail.tsx
│   │   ├── Analysis.tsx
│   │   ├── Insights.tsx
│   │   ├── Issues.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── components/         # Reusable components
│   │   └── layout/
│   ├── styles/             # CSS styles
│   └── types/              # TypeScript types
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (renderer only) |
| `npm run electron:dev` | Start full Electron app in dev mode |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |

## Repository Status Definitions

| Status | Description |
|--------|-------------|
| **Active** | Pushed within the last 7 days |
| **Maintained** | Pushed within the last 30 days |
| **Stale** | No push in 30-90 days |
| **Abandoned** | No push in 90+ days |
| **Archived** | Archived on GitHub |

## Data Storage

All data is stored locally in an SQLite database:
- **Windows**: `%APPDATA%/github-dashboard/github-dashboard.db`
- **macOS**: `~/Library/Application Support/github-dashboard/github-dashboard.db`
- **Linux**: `~/.config/github-dashboard/github-dashboard.db`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
