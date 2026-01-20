"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SettingsContent.module.css";

interface SettingsContentProps {
  user: {
    id: number;
    username: string;
    email: string | null;
    avatarUrl: string | null;
  };
}

export function SettingsContent({ user }: SettingsContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [topicResult, setTopicResult] = useState<string | null>(null);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;

    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const handleGenerateTopics = async () => {
    if (!confirm("This will auto-generate and apply topics to all your GitHub repositories. Continue?")) {
      return;
    }

    setIsGeneratingTopics(true);
    setTopicResult(null);

    try {
      const response = await fetch("/api/repositories/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyAll: true }),
      });

      if (!response.ok) throw new Error("Failed to generate topics");

      const result = await response.json();
      setTopicResult(`Applied topics to ${result.applied} repositories${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
    } catch (error) {
      console.error("Error generating topics:", error);
      setTopicResult("Failed to generate topics. Please try again.");
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account and preferences</p>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <div className={styles.sectionContent}>
            <div className={styles.profileCard}>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className={styles.avatar}
                />
              )}
              <div className={styles.profileInfo}>
                <span className={styles.username}>{user.username}</span>
                {user.email && (
                  <span className={styles.email}>{user.email}</span>
                )}
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.githubLink}
                >
                  View GitHub Profile
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Repository Tools</h2>
          <div className={styles.sectionContent}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Auto-Generate Topics</span>
                <span className={styles.settingDesc}>
                  Analyze all repositories and apply relevant topics based on names, descriptions, and languages
                </span>
                {topicResult && (
                  <span className={styles.settingResult}>{topicResult}</span>
                )}
              </div>
              <button
                onClick={handleGenerateTopics}
                disabled={isGeneratingTopics}
                className={styles.actionButton}
              >
                {isGeneratingTopics ? "Generating..." : "Generate Topics"}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.sectionContent}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Sign Out</span>
                <span className={styles.settingDesc}>
                  Sign out of your GitHub Dashboard account
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={styles.dangerButton}
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.sectionContent}>
            <div className={styles.aboutInfo}>
              <p>
                <strong>GitHub Repository Dashboard</strong>
              </p>
              <p className={styles.aboutText}>
                A tool to help you manage, analyze, and organize your GitHub repositories.
                Track repository status, identify projects that need attention, and get
                AI-powered cleanup recommendations.
              </p>
              <p className={styles.version}>Version 0.1.0</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
