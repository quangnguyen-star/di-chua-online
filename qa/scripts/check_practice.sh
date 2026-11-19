#!/usr/bin/env bash
# BACKEND-EFFECT check: print the live row and any pending revision of a seeded practice.
#   check_practice.sh <id>   ->  {"status","version","title","pending_title","pending_submitted","reviews"}
source "$(dirname "$0")/_common.sh"
require_env
id="${1:?usage: check_practice.sh <id>}"
[[ "$id" =~ ^[0-9]+$ ]] || die "id must be numeric"
out="$(pg -v id="$id" <<'SQL'
SELECT json_build_object(
  'status', p.status,
  'version', p.version,
  'title', p.title,
  'pending_title', COALESCE(r.snapshot->>'title', 'none'),
  'pending_submitted', COALESCE(r.snapshot->>'submitted', 'none'),
  'reviews', (SELECT count(*) FROM content_review c WHERE c.practice_id = p.id))
FROM practice p
LEFT JOIN practice_revision r ON r.practice_id = p.id AND r.version = p.version + 1
WHERE p.id = :'id'::int;
SQL
)"
[ -n "$out" ] || die "practice $id not found"
echo "$out"
