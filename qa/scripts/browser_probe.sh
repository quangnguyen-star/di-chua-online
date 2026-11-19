#!/usr/bin/env bash
# Browser state probes for what a suite step cannot express (a 360px viewport, reduced
# motion, request/storage inspection, timed pause checks). Drives a throwaway headless
# Chromium against QA_BASE_URL and prints one JSON object whose fields a suite captures.
#   browser_probe.sh <mode> <run_id> [path]
# modes: overflow (path: / | /visit | /practices), reduced-motion, privacy, breathing, audio-gesture
source "$(dirname "$0")/_common.sh"
: "${QA_BASE_URL:?QA_BASE_URL not set}"
exec python3 "$here/browser_probe.py" "$@"
