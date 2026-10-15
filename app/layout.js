import "./globals.css";

export const metadata = {
  title: "The Fadeproof House — Fadeproof Points",
  description: "Complete tasks, earn FPPs, climb the leaderboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-ink min-h-screen">
        <nav className="flex justify-center gap-6 py-4 border-b border-neutral-200 bg-white text-sm font-medium">
          <a href="/">Home</a>
          <a href="/tasks">Tasks</a>
          <a href="/leaderboard">Leaderboard</a>
        </nav>
        {children}
      </body>
    </html>
  );
    }
