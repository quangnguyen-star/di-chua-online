import Link from "next/link";

export const metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <section className="not-found" data-testid="not-found">
      <svg className="not-found__gate" viewBox="0 0 200 160" role="img" aria-label="Cánh cổng chùa đã đóng">
        <path data-part="roof" d="M10 44 Q100 36 100 8 Q100 36 190 44 L184 56 H16 Z" />
        <rect data-part="post" x="28" y="56" width="14" height="96" />
        <rect data-part="post" x="158" y="56" width="14" height="96" />
        <rect data-part="door" x="42" y="64" width="116" height="88" />
        <line x1="100" y1="64" x2="100" y2="152" stroke="var(--wood)" strokeWidth="3" />
        <rect data-part="bar" x="48" y="104" width="104" height="8" rx="3" />
      </svg>
      <h1>Cổng này đang đóng</h1>
      <p className="muted">Trang bạn tìm không có ở đây. Mời bạn quay lại bản đồ để chọn một lối khác.</p>
      <div className="error-state__actions">
        <Link href="/" className="button" data-testid="not-found-map">
          Về bản đồ
        </Link>
        <Link href="/" className="button button--quiet" data-testid="not-found-home">
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}
