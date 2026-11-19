"use client";

import Link from "next/link";

export type ErrorStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type ErrorStateProps = {
  title: string;
  body: string;
  actions?: ErrorStateAction[];
};

export function ErrorState({ title, body, actions = [] }: ErrorStateProps) {
  return (
    <section className="error-state" role="alert">
      <h1>{title}</h1>
      <p className="muted">{body}</p>
      {actions.length > 0 && (
        <div className="error-state__actions">
          {actions.map((action) =>
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
