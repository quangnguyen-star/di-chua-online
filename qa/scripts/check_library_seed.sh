#!/usr/bin/env bash
# Precondition: the three seeded practices exist and are published (SEED_PUBLISHED=1
# on a fresh database). Prints their ids so a suite can address cards by testid.
source "$(dirname "$0")/_common.sh"
require_env
out="$(pg <<'SQL'
SELECT json_build_object(
  'breath_id', max(id) FILTER (WHERE slug = 'tho-hai-phut'),
  'scan_id',   max(id) FILTER (WHERE slug = 'quet-co-the'),
  'walk_id',   max(id) FILTER (WHERE slug = 'di-bo-cham'),
  'published', count(*))
FROM practice
WHERE status = 'published' AND slug IN ('tho-hai-phut', 'quet-co-the', 'di-bo-cham');
SQL
)"
[ "$(printf '%s' "$out" | jq -r .published)" = "3" ] \
  || die "seeded practices are not all published (start the app with SEED_PUBLISHED=1 on an empty database)"
echo "$out"
