"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Bản đồ" },
  { href: "/visit", label: "Đi chùa" },
  { href: "/practices", label: "Thực hành" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Điều hướng chính">
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
