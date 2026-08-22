import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty-state" id="main-content">
      <p className="eyebrow">404</p>
      <h1>This prototype page does not exist.</h1>
      <Link className="button button--primary" href="/">
        Return home
      </Link>
    </main>
  );
}
