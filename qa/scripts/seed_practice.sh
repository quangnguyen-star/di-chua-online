#!/usr/bin/env bash
# Seed ONE practice owned by this run and print {"id","slug","title"}.
#   seed_practice.sh <run_id> <label> <status> [kind] [with_audio]
# status: draft | in_review | published | archived. kind: practice (default) | breathing.
# with_audio=audio attaches an audio_key whose object does not exist, so the audio
# request fails (the failure path). A published breathing practice with audio sorts
# first, so the visit snapshot picks it.
source "$(dirname "$0")/_common.sh"
require_env
run_id="${1:?usage: seed_practice.sh <run_id> <label> <status> [kind] [with_audio]}"
label="${2:?label}"
status="${3:?status}"
kind="${4:-practice}"
audio="${5:-}"
case "$status" in draft|in_review|published|archived) ;; *) die "bad status $status" ;; esac
case "$kind" in practice|breathing) ;; *) die "bad kind $kind" ;; esac

slug="qa-$(slugify "$run_id")-$(slugify "$label")"
title="QA RUN ${run_id} ${label}"
audio_key=""
sort_order=1000
if [ -n "$audio" ]; then
  audio_key="audio/${slug}.mp3"
  sort_order=-100
fi

id="$(pg -v slug="$slug" -v title="$title" -v kind="$kind" -v status="$status" \
  -v audio="$audio_key" -v sort="$sort_order" -v run="$run_id" <<'SQL'
INSERT INTO practice (slug, kind, title, summary, body, duration_sec, audio_key, transcript,
                      rights_record, credits, sort_order, status)
VALUES (:'slug', :'kind', :'title', 'Summary for ' || :'title',
        'Body text for ' || :'title', 120, NULLIF(:'audio', ''),
        CASE WHEN :'audio' = '' THEN '' ELSE 'Transcript for ' || :'title' END,
        'QA rights record', 'QA credits', :'sort'::int, :'status')
ON CONFLICT (slug) DO UPDATE
  SET status = EXCLUDED.status, kind = EXCLUDED.kind, title = EXCLUDED.title,
      audio_key = EXCLUDED.audio_key, sort_order = EXCLUDED.sort_order, updated_at = now()
RETURNING id;
SQL
)"
jq -nc --argjson id "$id" --arg slug "$slug" --arg title "$title" '{id:$id, slug:$slug, title:$title}'
