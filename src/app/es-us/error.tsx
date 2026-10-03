"use client";

import Link from "next/link";
import type { ErrorInfo } from "next/error";

export default function ErrorPage({ retry }: ErrorInfo) {
  return (
    <section className="empty-state">
      <p className="eyebrow">Se produjo un error</p>
      <h1>No pudimos cargar esta página.</h1>
      <p>
        Inténtalo de nuevo. Si el problema continúa, vuelve al inicio e
        inténtalo más tarde.
      </p>
      <div className="button-row">
        <button
          className="button button--primary"
          type="button"
          onClick={retry}
        >
          Intentar de nuevo
        </button>
        <Link className="button" href="/es-us">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
