"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="empty-state" id="main-content">
      <p className="eyebrow">Something went wrong</p>
      <h1>We couldn’t load this page.</h1>
      <p>Please try again. If the problem continues, return home and try again later.</p>
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="button" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
