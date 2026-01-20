import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Status and action type values (SQLite doesn't support enums)
export const REPO_STATUS_VALUES = [
  "active",
  "maintained",
  "stale",
  "abandoned",
  "archived",
  "deprecated",
] as const;

export const ACTION_TYPE_VALUES = [
  "archive",
  "delete",
  "review",
  "keep",
  "transfer",
] as const;

export type RepoStatus = (typeof REPO_STATUS_VALUES)[number];
export type ActionType = (typeof ACTION_TYPE_VALUES)[number];

// Users table
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    githubId: integer("github_id").notNull().unique(),
    username: text("username", { length: 255 }).notNull(),
    email: text("email", { length: 255 }),
    avatarUrl: text("avatar_url"),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("users_github_id_idx").on(table.githubId)]
);

// Repositories table
export const repositories = sqliteTable(
  "repositories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    githubId: integer("github_id").notNull(),
    name: text("name", { length: 255 }).notNull(),
    fullName: text("full_name", { length: 512 }).notNull(),
    description: text("description"),
    htmlUrl: text("html_url").notNull(),

    // Ownership
    isPrivate: integer("is_private", { mode: "boolean" }).default(false),
    isFork: integer("is_fork", { mode: "boolean" }).default(false),
    isArchived: integer("is_archived", { mode: "boolean" }).default(false),
    isTemplate: integer("is_template", { mode: "boolean" }).default(false),

    // Metrics from GitHub
    stargazersCount: integer("stargazers_count").default(0),
    watchersCount: integer("watchers_count").default(0),
    forksCount: integer("forks_count").default(0),
    openIssuesCount: integer("open_issues_count").default(0),

    // Language and topics
    language: text("language", { length: 100 }),
    topics: text("topics", { mode: "json" }).$type<string[]>().default([]),

    // Activity timestamps
    createdAtGithub: integer("created_at_github", { mode: "timestamp" }),
    updatedAtGithub: integer("updated_at_github", { mode: "timestamp" }),
    pushedAt: integer("pushed_at", { mode: "timestamp" }),

    // Calculated fields (using text for enum-like values)
    status: text("status", { length: 20 }).$type<RepoStatus>().default("active"),
    priorityScore: integer("priority_score").default(50),
    healthScore: integer("health_score").default(50),

    // User-defined fields
    userStatus: text("user_status", { length: 20 }).$type<RepoStatus>(),
    plannedAction: text("planned_action", { length: 20 }).$type<ActionType>(),
    actionDeadline: integer("action_deadline", { mode: "timestamp" }),

    // Sync tracking
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    syncError: text("sync_error"),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("repos_user_id_idx").on(table.userId),
    index("repos_status_idx").on(table.status),
    index("repos_priority_idx").on(table.priorityScore),
    uniqueIndex("repos_user_github_id_idx").on(table.userId, table.githubId),
  ]
);

// Repository notes/comments
export const repositoryNotes = sqliteTable(
  "repository_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    repositoryId: integer("repository_id")
      .references(() => repositories.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index("notes_repo_id_idx").on(table.repositoryId)]
);

// Repository activity snapshots (for trend analysis)
export const repositorySnapshots = sqliteTable(
  "repository_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    repositoryId: integer("repository_id")
      .references(() => repositories.id)
      .notNull(),
    snapshotDate: integer("snapshot_date", { mode: "timestamp" }).notNull(),
    stargazersCount: integer("stargazers_count"),
    forksCount: integer("forks_count"),
    openIssuesCount: integer("open_issues_count"),
    commitCount: integer("commit_count"),
    contributorCount: integer("contributor_count"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("snapshots_repo_date_idx").on(table.repositoryId, table.snapshotDate),
  ]
);

// User sessions
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id", { length: 255 }).primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
);

// Action log for audit trail
export const actionLogs = sqliteTable("action_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  repositoryId: integer("repository_id").references(() => repositories.id),
  action: text("action", { length: 100 }).notNull(),
  details: text("details", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  repositories: many(repositories),
  sessions: many(sessions),
  notes: many(repositoryNotes),
  actionLogs: many(actionLogs),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  user: one(users, {
    fields: [repositories.userId],
    references: [users.id],
  }),
  notes: many(repositoryNotes),
  snapshots: many(repositorySnapshots),
}));

export const repositoryNotesRelations = relations(repositoryNotes, ({ one }) => ({
  repository: one(repositories, {
    fields: [repositoryNotes.repositoryId],
    references: [repositories.id],
  }),
  user: one(users, {
    fields: [repositoryNotes.userId],
    references: [users.id],
  }),
}));

export const repositorySnapshotsRelations = relations(
  repositorySnapshots,
  ({ one }) => ({
    repository: one(repositories, {
      fields: [repositorySnapshots.repositoryId],
      references: [repositories.id],
    }),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const actionLogsRelations = relations(actionLogs, ({ one }) => ({
  user: one(users, {
    fields: [actionLogs.userId],
    references: [users.id],
  }),
  repository: one(repositories, {
    fields: [actionLogs.repositoryId],
    references: [repositories.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
export type RepositoryNote = typeof repositoryNotes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ActionLog = typeof actionLogs.$inferSelect;
