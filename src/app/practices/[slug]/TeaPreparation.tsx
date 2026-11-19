"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere";
import { routes } from "@/content/routes";
import { useActiveTimer } from "@/lib/useActiveTimer";
import { VerandaArt } from "../../places/veranda/VerandaArt";
import type { PracticeKind } from "../labels";
import { TeaCup } from "./compositions/TeaCup";
import styles from "./TeaPreparation.module.css";

const STEEP_SECONDS = 60;
const SIPS = 3;

const prepSteps = [
  {
    title: "Chuẩn bị nước",
    body: "Đun hoặc rót nước vào ấm đất. Làm theo nhịp của bạn, không cần vội.",
  },
  {
    title: "Chọn ấm và chén",
    body: "Đặt ấm đất và một chiếc chén sứ nhỏ lên khay. Không có bộ ấm chén cũng không sao: một chiếc tách hay một cốc là đủ.",
  },
  {
    title: "Cho trà vào ấm",
    body: "Cho một chút trà vào ấm. Không có trà thì rót một cốc nước ấm hoặc nước lọc, bước này bạn có thể bỏ qua.",
  },
  {
    title: "Rót nước",
    body: "Rót nước nóng vào ấm, chậm tay. Nếu không có ấm, chỉ cần xoa hai bàn tay vào nhau cho ấm.",
  },
  {
    title: "Chờ một lát",
    body: "Để ấm yên khoảng một phút, hoặc theo thói quen của bạn. Bạn có thể bỏ qua phần chờ bất cứ lúc nào.",
  },
  {
    title: "Rót ra chén",
    body: "Rót trà ra chén, nhìn hơi nước bốc lên. Dùng hai tay đỡ chén cho ấm lòng bàn tay.",
  },
  {
    title: "Ngồi xuống và chậm lại",
    body: "Ngồi xuống, thả vai, thở ra một hơi dài. Khi thấy sẵn sàng thì sang bước thưởng trà. Đồng hồ chưa chạy ở đây.",
  },
];

const STEEP_INDEX = 4;
const DRINK = prepSteps.length;

function format(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type Props = {
  slug: string;
  seconds: number;
  closingLine: string;
  kind: PracticeKind;
  next: { href: string; title: string } | null;
};

function SteepWait() {
  const { remainingMs, running, done, start, pause, reset } = useActiveTimer(STEEP_SECONDS);
  const untouched = !running && !done && remainingMs === STEEP_SECONDS * 1000;
  return (
    <div data-testid="tea-steep">
      <p className={styles.clock} role="timer" aria-live="off" data-testid="tea-steep-remaining">
        {format(remainingMs)}
      </p>
      <p className="muted" role="status" data-testid="tea-steep-state">
        {done ? "Đã chờ xong, bạn có thể rót trà" : running ? "Đang chờ" : untouched ? "Chưa bắt đầu chờ" : "Đang tạm dừng"}
      </p>
      <div className="actions">
        {!done && (
          <button type="button" className="button button--quiet" onClick={running ? pause : start} data-testid="tea-steep-toggle">
            {running ? "Tạm dừng" : untouched ? "Bắt đầu chờ" : "Tiếp tục chờ"}
          </button>
        )}
        {!done && (
          <button type="button" className="button button--quiet" onClick={reset} data-testid="tea-steep-reset" hidden={untouched}>
            Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}

function Enjoyment({ seconds, closingLine, onBack }: { seconds: number; closingLine: string; onBack: () => void }) {
  const { cue } = useAtmosphere();
  const { remainingMs, running, done, start, pause, reset } = useActiveTimer(seconds);
  const total = seconds * 1000;
  const untouched = !running && !done && remainingMs === total;
  const elapsed = total - remainingMs;
  const sips = done ? SIPS : untouched ? 0 : Math.min(SIPS, Math.floor(elapsed / (total / SIPS)) + 1);
  const next = routes.find((r) => r.id === "veranda")?.next;
  const nextPlace = routes.find((r) => r.id === next);

  useEffect(() => {
    if (sips > 0 && !done) cue("cup");
  }, [sips, done, cue]);

  return (
    <section aria-labelledby="tea-drink-title" data-testid="tea-drinking">
      <h2 id="tea-drink-title">Thưởng trà</h2>
      <TeaCup running={running} />
      <p className={styles.clock} role="timer" aria-live="off" data-testid="tea-remaining">
        {format(remainingMs)}
      </p>
      <ol className={styles.sips} aria-label="Ba ngụm trà" data-testid="tea-sips">
        {Array.from({ length: SIPS }, (_, i) => (
          <li key={i} className={`${styles.sip} ${i < sips ? styles.sipDone : ""}`} aria-label={`Ngụm ${i + 1}${i < sips ? ", đã xong" : ""}`} />
        ))}
      </ol>
      <p className="muted" role="status" data-testid="tea-state">
        {done ? "Đã xong" : running ? `Ngụm ${sips} trên ${SIPS}` : untouched ? "Sẵn sàng" : "Đang tạm dừng"}
      </p>
      <div className="actions">
        {done ? (
          <button type="button" className="button" onClick={reset} data-testid="tea-restart">
            Thưởng trà lại
          </button>
        ) : (
          <button type="button" className="button" onClick={running ? pause : start} data-testid={running ? "tea-pause" : "tea-start"}>
            {running ? "Tạm dừng" : untouched ? "Bắt đầu" : "Tiếp tục"}
          </button>
        )}
        {!done && untouched && (
          <button type="button" className="button button--quiet" onClick={onBack} data-testid="tea-prep-back">
            Quay lại
          </button>
        )}
      </div>
      {done && (
        <div data-testid="tea-complete">
          <p role="status" data-testid="tea-closing">
            <em>{closingLine}</em>
          </p>
          {nextPlace && (
            <p className="muted" data-testid="tea-next-preview">
              Phía trước: {nextPlace.name}. {nextPlace.blurb}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function TeaPreparation({ seconds, closingLine }: Props) {
  const { scene } = useAtmosphere();
  const [index, setIndex] = useState(0);
  const drinking = index >= DRINK;

  useEffect(() => {
    scene("veranda");
  }, [scene]);

  useEffect(() => {
    if (drinking) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(DRINK, i + 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drinking]);

  const step = prepSteps[index];

  return (
    <div className={styles.wrap} data-testid="tea-preparation">
      <div className={styles.art}>
        <VerandaArt />
      </div>
      {!drinking && step && (
        <section className={styles.panel} aria-labelledby="tea-prep-title">
          <p className="muted" data-testid="tea-prep-progress">
            Chuẩn bị, bước {index + 1} trên {prepSteps.length} (không bắt buộc)
          </p>
          <h2 id="tea-prep-title">{step.title}</h2>
          <p data-testid="tea-prep-body">{step.body}</p>
          {index === STEEP_INDEX && <SteepWait />}
          <div className="actions">
            <button type="button" className="button" onClick={() => setIndex(index + 1)} data-testid="tea-prep-next">
              {index === STEEP_INDEX ? "Bỏ qua chờ, tiếp tục" : "Tiếp tục"}
            </button>
            {index > 0 && (
              <button type="button" className="button button--quiet" onClick={() => setIndex(index - 1)} data-testid="tea-prep-back">
                Quay lại
              </button>
            )}
            <button type="button" className="button button--quiet" onClick={() => setIndex(DRINK)} data-testid="tea-prep-skip">
              Chỉ thưởng trà
            </button>
          </div>
          <p className={`muted ${styles.hint}`}>Phím mũi tên phải để tiếp tục, mũi tên trái để quay lại.</p>
        </section>
      )}
      {drinking && <Enjoyment seconds={seconds} closingLine={closingLine} onBack={() => setIndex(DRINK - 1)} />}
      <p className="actions">
        <Link href="/" className="button button--quiet" data-testid="veranda-map">
          Về bản đồ chùa
        </Link>
      </p>
    </div>
  );
}
