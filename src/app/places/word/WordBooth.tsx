"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { vnNow } from "@/lib/clock";
import { monthCalendar } from "@/lib/lunar/calendar";
import { buildIcs } from "@/lib/ics";
import type { Embed } from "@/lib/visit/embed";
import { WORD_KEY, parseRecord, pickWord, recordFor } from "./wordPick";
import type { WordRecord } from "./wordPick";
import { renderStoryCard } from "./storyCard";
import StageZones from "@/components/visit/StageZones";
import { useInstruction } from "@/components/visit/useInstruction";
import styles from "./word.module.css";

function load(today: string): WordRecord {
  let prev: WordRecord | null = null;
  try {
    prev = parseRecord(window.localStorage.getItem(WORD_KEY));
  } catch {
    prev = null;
  }
  const rec = recordFor(prev, today, () => crypto.randomUUID());
  save(rec);
  return rec;
}

function save(rec: WordRecord) {
  try {
    window.localStorage.setItem(WORD_KEY, JSON.stringify(rec));
  } catch {
    // storage unavailable: the record lives in component state for this visit
  }
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const POCKET_HOLD_MS = 900;
const INSTRUCTION_LINES = [
  "Một chữ đã được chọn cho bạn. Chạm vào tờ giấy đỏ để mở.",
  "Giữ tờ giấy, hoặc bấm Cất vào túi, để mang chữ theo.",
  "Chữ đã nằm trong túi bạn. Mang theo nhé.",
] as const;

/** Stop 6: the day's word arrives as a red paper. Tap to open it, hold (or press the pocket button) to keep it. */
export default function WordBooth({ embed }: { embed?: Embed } = {}) {
  const { scene } = useAtmosphere();
  const [rec, setRec] = useState<WordRecord | null>(null);
  const [today, setToday] = useState<{ y: number; m: number } | null>(null);
  const [error, setError] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [pocketed, setPocketed] = useState(false);
  const [holding, setHolding] = useState(false);
  const instruction = useInstruction(INSTRUCTION_LINES);
  const holdTimer = useRef<number | null>(null);
  const tourPaused = embed?.paused ?? false;

  useEffect(() => {
    scene("outside");
    const iso = vnNow().iso;
    setRec(load(iso));
    setToday({ y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) });
  }, [scene]);

  useEffect(() => {
    if (!embed) return;
    const id = window.setTimeout(() => setPulled(true), 60);
    return () => window.clearTimeout(id);
  }, [embed]);

  const cancelHold = useCallback(() => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  }, []);

  useEffect(() => cancelHold, [cancelHold]);

  const pocket = () => {
    setPocketed(true);
    instruction.advance();
  };

  const startHold = () => {
    if (holdTimer.current !== null || tourPaused) return;
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setHolding(false);
      pocket();
    }, POCKET_HOLD_MS);
  };

  function reveal() {
    if (!rec) return;
    const next = { ...rec, revealed: true };
    save(next);
    setRec(next);
    instruction.advance();
  }

  async function exportPng() {
    if (!rec) return;
    const w = pickWord(rec.id, rec.date);
    const blob = await renderStoryCard(w.word, w.reflection);
    if (!blob) return setError(true);
    setError(false);
    download(blob, `loi-nhac-${rec.date}.png`);
  }

  function exportIcs() {
    if (!today) return;
    download(new Blob([buildIcs(today.y)], { type: "text/calendar;charset=utf-8" }), `lich-am-${today.y}.ics`);
  }

  const word = rec ? pickWord(rec.id, rec.date) : null;
  const days = today ? monthCalendar(today.y, today.m) : [];
  const lead = days.length ? (new Date(Date.UTC(today!.y, today!.m - 1, 1)).getUTCDay() + 6) % 7 : 0;

  if (embed) {
    return (
      <div className={styles.fullscreen} data-testid="word-page" data-pulled={pulled} data-pocketed={pocketed}>
        <div className={`${styles.warm} ${pulled ? styles.warmed : ""}`} aria-hidden="true" />
        <StageZones
          instruction={instruction}
          actions={
            word && rec && rec.revealed && !pocketed ? (
              <>
                <button type="button" className="button" onClick={pocket} data-testid="word-pocket">Cất vào túi</button>
                <button type="button" className="button button--quiet" onClick={exportPng} data-testid="word-export">Lưu thành ảnh</button>
              </>
            ) : null
          }
        >
          {!word || !rec ? null : pocketed ? (
            <div className={styles.pocketed} data-testid="word-pocketed" />
          ) : rec.revealed ? (
            <>
              <button
                type="button"
                className={`${styles.paper} ${holding ? styles.holding : ""}`}
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                aria-label={`${word.word}. Giữ để cất vào túi`}
                data-testid="word-paper"
              >
                <span className={styles.word} data-testid="word-text">{word.word}</span>
                <span>{word.reflection}</span>
                <small>{word.credit}</small>
              </button>
              {error ? <p role="alert">Chưa tạo được ảnh. Bạn thử lại nhé.</p> : null}
            </>
          ) : (
            <button type="button" className={styles.paper} onClick={reveal} aria-label="Mở chữ" data-testid="word-open" />
          )}
        </StageZones>
      </div>
    );
  }

  return (
    <section className={styles.root} aria-labelledby="word-title" data-testid="word-page">
      <h1 id="word-title">Quầy chữ</h1>
      {word && rec ? (
        rec.revealed ? (
          <div className={styles.reveal} data-testid="word-revealed">
            <p className={styles.word} data-testid="word-text">{word.word}</p>
            <p>{word.reflection}</p>
            <p className="muted">{word.credit}</p>
            <button type="button" className="button" onClick={exportPng} data-testid="word-export">Lưu thành ảnh</button>
            {error ? <p role="alert">Chưa tạo được ảnh. Bạn thử lại nhé.</p> : null}
          </div>
        ) : (
          <div>
            <p>Một chữ đã được chọn cho bạn hôm nay. Hít một hơi, rồi mở ra.</p>
            <button type="button" className="button" onClick={reveal} data-testid="word-open">Mở chữ</button>
          </div>
        )
      ) : (
        <p role="status">Đang chuẩn bị chữ cho bạn…</p>
      )}

      <h2>Lịch âm tháng này</h2>
      {days.length ? (
        <div className={styles.grid} role="grid" aria-label={`Tháng ${today!.m} năm ${today!.y}`} data-testid="month-calendar">
          {Array.from({ length: lead }, (_, i) => <span key={`pad-${i}`} />)}
          {days.map((d) => (
            <div
              key={d.iso}
              role="gridcell"
              className={styles.day}
              data-testid={`cal-${d.iso}`}
              data-mark={d.lunar.note ?? (d.special ? "special" : undefined)}
              title={d.special}
              aria-label={`${d.solarDay}, âm lịch ${d.lunar.day}/${d.lunar.month}${d.lunar.leap ? " nhuận" : ""}${d.special ? `, ${d.special}` : ""}`}
            >
              <span>{d.solarDay}</span>
              <small>{d.lunar.note === "ram" ? "◯" : d.lunar.day === 1 ? `1/${d.lunar.month}` : d.lunar.day}</small>
            </div>
          ))}
        </div>
      ) : null}
      <p className="muted">Ô sáng là mùng một, vầng trăng tròn là rằm.</p>
      <button type="button" className="button" onClick={exportIcs} data-testid="ics-download">Tải lịch mùng một và rằm (.ics)</button>
    </section>
  );
}
