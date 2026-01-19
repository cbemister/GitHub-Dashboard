import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Dashboard - Repository Status Tracker",
  description:
    "Review, prioritize, and clean up your GitHub repositories. Identify stale projects and decide what to archive or delete.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
