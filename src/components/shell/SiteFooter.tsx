import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Thông tin">
          <Link href="/about">Giới thiệu</Link>
          <Link href="/privacy">Quyền riêng tư</Link>
        </nav>
        <p className="site-footer__note">Chánh niệm mỗi ngày</p>
      </div>
    </footer>
  );
}
