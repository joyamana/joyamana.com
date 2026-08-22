"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="empty-state" id="main-content">
      <p className="eyebrow">Prototype error</p>
      <h1>Something interrupted this page.</h1>
      <button className="button button--primary" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
