import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const repoStatusEnum = pgEnum("repo_status", [
  "active", // Recent commits, open issues being addressed
  "maintained", // Occasional updates, stable
  "stale", // No recent activity (30-90 days)
  "abandoned", // No activity for 90+ days
  "archived", // Officially archived on GitHub
  "deprecated", // Marked for deletion/archive by user
]);

export const actionTypeEnum = pgEnum("action_type", [
  "archive",
  "delete",
  "review",
  "keep",
  "transfer",
]);

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    githubId: integer("github_id").notNull().unique(),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    avatarUrl: text("avatar_url"),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at"),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_github_id_idx").on(table.githubId)]
);

// Repositories table
export const repositories = pgTable(
  "repositories",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    githubId: integer("github_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 512 }).notNull(),
    description: text("description"),
    htmlUrl: text("html_url").notNull(),

    // Ownership
    isPrivate: boolean("is_private").default(false),
    isFork: boolean("is_fork").default(false),
    isArchived: boolean("is_archived").default(false),
    isTemplate: boolean("is_template").default(false),

    // Metrics from GitHub
    stargazersCount: integer("stargazers_count").default(0),
    watchersCount: integer("watchers_count").default(0),
    forksCount: integer("forks_count").default(0),
    openIssuesCount: integer("open_issues_count").default(0),

    // Language and topics
    language: varchar("language", { length: 100 }),
    topics: jsonb("topics").$type<string[]>().default([]),

    // Activity timestamps
    createdAtGithub: timestamp("created_at_github"),
    updatedAtGithub: timestamp("updated_at_github"),
    pushedAt: timestamp("pushed_at"),

    // Calculated fields
    status: repoStatusEnum("status").default("active"),
    priorityScore: integer("priority_score").default(50),
    healthScore: integer("health_score").default(50),

    // User-defined fields
    userStatus: repoStatusEnum("user_status"),
    plannedAction: actionTypeEnum("planned_action"),
    actionDeadline: timestamp("action_deadline"),

    // Sync tracking
    lastSyncAt: timestamp("last_sync_at"),
    syncError: text("sync_error"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("repos_user_id_idx").on(table.userId),
    index("repos_status_idx").on(table.status),
    index("repos_priority_idx").on(table.priorityScore),
    uniqueIndex("repos_user_github_id_idx").on(table.userId, table.githubId),
  ]
);

// Repository notes/comments
export const repositoryNotes = pgTable(
  "repository_notes",
  {
    id: serial("id").primaryKey(),
    repositoryId: integer("repository_id")
      .references(() => repositories.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("notes_repo_id_idx").on(table.repositoryId)]
);

// Repository activity snapshots (for trend analysis)
export const repositorySnapshots = pgTable(
  "repository_snapshots",
  {
    id: serial("id").primaryKey(),
    repositoryId: integer("repository_id")
      .references(() => repositories.id)
      .notNull(),
    snapshotDate: timestamp("snapshot_date").notNull(),
    stargazersCount: integer("stargazers_count"),
    forksCount: integer("forks_count"),
    openIssuesCount: integer("open_issues_count"),
    commitCount: integer("commit_count"),
    contributorCount: integer("contributor_count"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("snapshots_repo_date_idx").on(table.repositoryId, table.snapshotDate),
  ]
);

// User sessions
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
);

// Action log for audit trail
export const actionLogs = pgTable("action_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  repositoryId: integer("repository_id").references(() => repositories.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
export type RepoStatus = (typeof repoStatusEnum.enumValues)[number];
export type ActionType = (typeof actionTypeEnum.enumValues)[number];
