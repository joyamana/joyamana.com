"use client";

import Link from "next/link";
import type { ErrorInfo } from "next/error";

export default function ErrorPage({
  retry,
}: ErrorInfo) {
  return (
    <main className="empty-state" id="main-content">
      <p className="eyebrow">Something went wrong</p>
      <h1>We couldn’t load this page.</h1>
      <p>Please try again. If the problem continues, return home and try again later.</p>
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={retry}>
          Try again
        </button>
        <Link className="button" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
