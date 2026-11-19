"use client";

import { useEffect, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { vnNow } from "@/lib/clock";
import { monthCalendar } from "@/lib/lunar/calendar";
import { buildIcs } from "@/lib/ics";
import { WORD_KEY, parseRecord, pickWord, recordFor } from "./wordPick";
import type { WordRecord } from "./wordPick";
import { renderStoryCard } from "./storyCard";
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

export default function WordBooth() {
  const { scene } = useAtmosphere();
  const [rec, setRec] = useState<WordRecord | null>(null);
  const [today, setToday] = useState<{ y: number; m: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    scene("outside");
    const iso = vnNow().iso;
    setRec(load(iso));
    setToday({ y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) });
  }, [scene]);

  function reveal() {
    if (!rec) return;
    const next = { ...rec, revealed: true };
    save(next);
    setRec(next);
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
