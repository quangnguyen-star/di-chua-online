#!/usr/bin/env bash
# Shared helpers for qa/scripts/*.sh, SOURCED by the step scripts.
# The runner exports QA_RUN_ID, QA_TAG and QA_BASE_URL. The database connection
# (DATABASE_URL) comes from this directory's own .env (git-ignored) or the
# environment, never from a suite. The app has no /test seam, so state is seeded
# and read straight from Postgres, and only rows carrying this run's namespace
# (slug prefix qa-<run>-, title "QA RUN <run_id> ...") are ever written.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$here/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$here/.env"
  set +a
fi

die() { echo "$*" >&2; exit 1; }

require_env() {
  : "${QA_RUN_ID:?QA_RUN_ID not set (run me via the QA runner)}"
  : "${DATABASE_URL:?DATABASE_URL not set (put it in qa/scripts/.env)}"
}

pg() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -qAtX "$@"; }

# Lowercase words joined by hyphens: the slug alphabet the admin API accepts.
slugify() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'; }
