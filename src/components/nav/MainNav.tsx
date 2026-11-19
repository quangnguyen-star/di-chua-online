"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/visit", label: "Đi chùa" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Điều hướng chính">
      <Link
        href="/"
        aria-label="Bản đồ chùa"
        aria-current={pathname === "/" ? "page" : undefined}
        className="nav__icon"
        data-testid="nav-map"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
          <path d="M9 4v13.5M15 6.5V20" />
        </svg>
      </Link>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "nav__link nav__link--active" : "nav__link"}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
