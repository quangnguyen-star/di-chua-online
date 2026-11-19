import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Noto_Serif } from "next/font/google";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/600.css";
import "../styles/globals.css";
import "../styles/evening.css";
import "../styles/tokens.css";
import { MainNav } from "../components/nav/MainNav";
import { AtmosphereProvider, SoundControl } from "../components/atmosphere";
import { SiteFooter } from "../components/shell/SiteFooter";

const notoSerif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  weight: "500",
  variable: "--font-noto-serif",
  display: "swap",
});

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
    <html lang="vi" className={notoSerif.variable}>
      <body>
        <AtmosphereProvider>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand">
              Chánh niệm mỗi ngày
            </Link>
            <MainNav />
            <SoundControl />
          </div>
        </header>
        <main className="container reading">{children}</main>
        <SiteFooter />
        </AtmosphereProvider>
      </body>
    </html>
  );
}
