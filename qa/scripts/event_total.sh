#!/usr/bin/env bash
# BACKEND-EFFECT check for analytics. Prints {"total": N, "advanced": "yes"} for an event name.
#   event_total.sh <name> [before]
# With <before>, waits (events are sent by beacon) until the total exceeds it and fails otherwise.
source "$(dirname "$0")/_common.sh"
require_env
name="${1:?usage: event_total.sh <name> [before]}"
before="${2:-}"
total() {
  pg -v name="$name" <<'SQL'
SELECT CASE WHEN to_regclass('event_counts') IS NULL THEN 0
            ELSE (SELECT COALESCE(SUM(count), 0) FROM event_counts WHERE name = :'name') END;
SQL
}
n="$(total)"
if [ -n "$before" ]; then
  for _ in $(seq 1 20); do
    [ "$n" -gt "$before" ] && break
    sleep 0.5
    n="$(total)"
  done
  [ "$n" -gt "$before" ] || die "event ${name} did not advance past ${before}"
fi
jq -nc --argjson n "$n" '{total:$n, advanced:"yes"}'
