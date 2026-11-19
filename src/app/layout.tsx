import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/600.css";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Chánh niệm mỗi ngày",
  description: "Những khoảnh khắc chánh niệm ngắn cho mỗi ngày.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand">
              Chánh niệm mỗi ngày
            </Link>
            <nav className="nav" aria-label="Điều hướng chính">
              <Link href="/">Hôm nay</Link>
              <Link href="/practices">Thực hành</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
