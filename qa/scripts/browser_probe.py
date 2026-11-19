import json
import os
import sys
import time
from urllib.parse import quote

from playwright.sync_api import sync_playwright

BASE = os.environ["QA_BASE_URL"].rstrip("/")
MODE = sys.argv[1]
RUN_ID = sys.argv[2]
ARG = sys.argv[3] if len(sys.argv) > 3 else "/"

INTENTION_LABEL = "Điều bạn muốn gửi gắm hôm nay"
INTENTION = f"QA intention {RUN_ID}"


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def to_intention(page):
    page.goto(f"{BASE}/visit")
    button(page, "Bắt đầu").click()
    button(page, "Bỏ qua").click()


def to_breathing(page):
    to_intention(page)
    button(page, "Bỏ qua").click()
    page.get_by_test_id("breathing-timer").wait_for()


def walk_to_close(page):
    to_intention(page)
    page.get_by_label(INTENTION_LABEL).fill(INTENTION)
    button(page, "Tiếp tục").click()
    button(page, "Bỏ qua").click()
    button(page, "Tiếp tục").click()
    page.get_by_role("link", name="Về trang chủ").wait_for()


def overflow(page):
    return page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")


def timer(page):
    return page.get_by_test_id("breathing-timer").inner_text().strip()


def probe_overflow(browser):
    ctx = browser.new_context(viewport={"width": 360, "height": 740})
    page = ctx.new_page()
    worst = 0
    if ARG == "/visit":
        page.goto(f"{BASE}/visit")
        button(page, "Bắt đầu").wait_for()
        worst = max(worst, overflow(page))
        button(page, "Bắt đầu").click()
        button(page, "Dâng hương").wait_for()
        worst = max(worst, overflow(page))
        button(page, "Dâng hương").click()
        worst = max(worst, overflow(page))
        button(page, "Tiếp tục").click()
        page.get_by_label(INTENTION_LABEL).fill("x" * 500)
        worst = max(worst, overflow(page))
        button(page, "Tiếp tục").click()
        page.get_by_test_id("breathing-timer").wait_for()
        worst = max(worst, overflow(page))
        button(page, "Bỏ qua").click()
        button(page, "Tiếp tục").wait_for()
        worst = max(worst, overflow(page))
        button(page, "Tiếp tục").click()
        page.get_by_role("link", name="Về trang chủ").wait_for()
        worst = max(worst, overflow(page))
    else:
        page.goto(f"{BASE}{ARG}")
        page.wait_for_load_state("networkidle")
        worst = overflow(page)
    return {"path": ARG, "overflow_px": max(worst, 0)}


def probe_reduced_motion(browser):
    out = {}
    for key, setting in (("reduced", "reduce"), ("default", "no-preference")):
        ctx = browser.new_context(reduced_motion=setting)
        page = ctx.new_page()
        page.goto(f"{BASE}/visit")
        button(page, "Bắt đầu").click()
        button(page, "Dâng hương").click()
        page.get_by_test_id("offered-state").wait_for()
        name = page.evaluate(
            "getComputedStyle(document.querySelector('.visit-ember')).animationName"
        )
        out[f"{key}_animation"] = name
        out[f"{key}_offered"] = "yes" if button(page, "Tiếp tục").is_enabled() else "no"
        ctx.close()
    return out


def probe_privacy(browser):
    ctx = browser.new_context()
    page = ctx.new_page()
    seen = []

    def on_request(req):
        seen.append(" ".join([req.url, req.post_data or "", json.dumps(req.headers)]))

    page.on("request", on_request)
    walk_to_close(page)
    page.reload()
    to_intention(page)
    page.get_by_label(INTENTION_LABEL).fill(INTENTION)
    button(page, "Kết thúc chuyến ghé thăm").click()
    button(page, "Kết thúc").click()
    page.get_by_role("heading", name="Đã kết thúc chuyến ghé thăm").wait_for()
    time.sleep(1)

    storage = page.evaluate(
        """async () => JSON.stringify({
            local: Object.entries(localStorage),
            session: Object.entries(sessionStorage),
            cookie: document.cookie,
            idb: indexedDB.databases ? (await indexedDB.databases()).map(d => d.name) : [],
        })"""
    )
    cookies = json.dumps(ctx.cookies())
    body = page.inner_text("body")
    needles = (RUN_ID, quote(RUN_ID))
    leaks = sum(1 for blob in seen for n in needles if n in blob)
    leaks += sum(1 for n in needles if n in storage or n in cookies or n in body)
    return {"requests_checked": len(seen), "leaks": leaks, "checked": "yes" if seen else "no"}


def probe_breathing(browser):
    ctx = browser.new_context()
    page = ctx.new_page()
    to_breathing(page)
    time.sleep(2.5)
    button(page, "Tạm dừng").click()
    paused_at = timer(page)
    time.sleep(2.2)
    frozen = timer(page) == paused_at
    button(page, "Tiếp tục thở").click()
    time.sleep(2.2)
    resumed = timer(page) != paused_at

    page.evaluate(
        """() => {
            Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        }"""
    )
    hidden_pauses = button(page, "Tiếp tục thở").is_visible()
    hidden_at = timer(page)
    time.sleep(2.2)
    hidden_frozen = timer(page) == hidden_at
    return {
        "frozen_while_paused": "yes" if frozen else "no",
        "resumed_counting": "yes" if resumed else "no",
        "hidden_pauses": "yes" if hidden_pauses else "no",
        "hidden_frozen": "yes" if hidden_frozen else "no",
    }


def probe_audio_gesture(browser):
    ctx = browser.new_context()
    page = ctx.new_page()
    audio_requests = []
    page.on("request", lambda r: audio_requests.append(r.url) if "/api/audio/" in r.url else None)
    to_breathing(page)
    button(page, "Nghe âm thanh").wait_for()
    time.sleep(1.5)
    before_requests = len(audio_requests)
    before_elements = page.locator("audio").count()
    button(page, "Nghe âm thanh").click()
    page.locator("audio").first.wait_for(state="attached")
    return {
        "requests_before_click": before_requests,
        "elements_before_click": before_elements,
        "element_after_click": page.locator("audio").count(),
    }


PROBES = {
    "overflow": probe_overflow,
    "reduced-motion": probe_reduced_motion,
    "privacy": probe_privacy,
    "breathing": probe_breathing,
    "audio-gesture": probe_audio_gesture,
}

with sync_playwright() as p:
    browser = p.chromium.launch()
    try:
        result = PROBES[MODE](browser)
    finally:
        browser.close()
print(json.dumps(result))
