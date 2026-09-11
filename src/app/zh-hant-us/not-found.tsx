import Link from "next/link";

export default function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404 · 找不到頁面</p>
      <h1>未能找到此頁面。</h1>
      <p>頁面可能已移動，或網址不正確。</p>
      <div className="button-row">
        <Link className="button button--primary" href="/zh-hant-us/shop">選購所有商品</Link>
        <Link className="button" href="/zh-hant-us">返回首頁</Link>
      </div>
    </section>
  );
}
