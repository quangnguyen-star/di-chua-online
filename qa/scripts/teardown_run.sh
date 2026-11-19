#!/usr/bin/env bash
# Remove every practice this run seeded (slug prefix qa-<run>-). Revisions and
# review rows go with them (ON DELETE CASCADE). Best effort; the janitor is the backstop.
source "$(dirname "$0")/_common.sh"
require_env
run_id="${1:-$QA_RUN_ID}"
pg -v prefix="qa-$(slugify "$run_id")-" <<'SQL' >/dev/null
DELETE FROM practice WHERE starts_with(slug, :'prefix');
SQL
echo '{"ok":"yes"}'
