"use client";

import Link from "next/link";
import { TamQuanStill } from "../temple/art";

export type ErrorStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type ErrorStateProps = {
  title: string;
  body: string;
  /** Offered actions; only the first is shown, so a failure always has exactly one way out. */
  actions?: ErrorStateAction[];
};

export function ErrorState({ title, body, actions = [] }: ErrorStateProps) {
  const recovery = actions.slice(0, 1);
  return (
    <section className="error-state" role="alert">
      <TamQuanStill label="" className="error-state__art" testId="error-state-art" />
      <h1>{title}</h1>
      <p className="muted">{body}</p>
      {recovery.length > 0 && (
        <div className="error-state__actions">
          {recovery.map((action) =>
            action.href ? (
              <Link key={action.label} href={action.href} className="button">
                {action.label}
              </Link>
            ) : (
              <button key={action.label} type="button" className="button" onClick={action.onClick}>
                {action.label}
              </button>
            ),
          )}
        </div>
      )}
    </section>
  );
}
