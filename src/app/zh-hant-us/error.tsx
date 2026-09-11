"use client";

import Link from "next/link";
import type { ErrorInfo } from "next/error";

export default function ErrorPage({ retry }: ErrorInfo) {
  return (
    <section className="empty-state">
      <p className="eyebrow">載入時出現問題</p>
      <h1>暫時未能載入此頁面。</h1>
      <p>請再試一次。如問題持續，請返回首頁，稍後再試。</p>
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={retry}>再試一次</button>
        <Link className="button" href="/zh-hant-us">返回首頁</Link>
      </div>
    </section>
  );
}
