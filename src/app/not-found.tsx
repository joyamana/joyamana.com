import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty-state" id="main-content">
      <p className="eyebrow">404 · Page not found</p>
      <h1>We couldn’t find that page.</h1>
      <p>The page may have moved, or the address may be incorrect.</p>
      <div className="button-row">
        <Link className="button button--primary" href="/shop">
          Shop all
        </Link>
        <Link className="button" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
