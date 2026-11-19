"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { activities } from "@/content/places";
import { useAtmosphere } from "@/components/atmosphere";
import styles from "./lantern.module.css";

const MAX_LENGTH = 500;
const RELEASE_MS = 4000;

type Phase = "writing" | "releasing" | "released";

/** The one optional continuation, read from the registry's next field on the lantern activity. */
const nextId = activities.find((a) => a.id === "lantern")?.next;
const nextStep = activities.find((a) => a.id === nextId && a.ready);

export default function LanternFlow() {
  const router = useRouter();
  const { scene, cue } = useAtmosphere();
  const [phase, setPhase] = useState<Phase>("writing");
  const [thought, setThought] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scene("pond");
  }, [scene]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const release = () => {
    if (phase !== "writing") return;
    setPhase("releasing");
    cue("water");
    timer.current = setTimeout(() => {
      timer.current = null;
      setThought("");
      setPhase("released");
    }, RELEASE_MS);
  };

  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setThought("");
    router.push("/");
  };

  return (
    <div className={styles.root}>
      <h1>Thả hoa đăng</h1>
      <div className={styles.live} role="status" aria-live="polite" data-testid="lantern-announcement">
        {phase === "releasing" ? "Ngọn đèn đang trôi đi" : phase === "released" ? "Ngọn đèn đã trôi đi" : ""}
      </div>

      <div className={styles.pond} data-phase={phase} data-testid="lantern-scene" aria-hidden="true">
        <div className={styles.water} />
        <div className={styles.lantern} />
      </div>

      {phase !== "released" && (
        <>
          <p className={styles.prompt}>
            Nếu muốn, hãy viết một điều bạn muốn buông xuống. Điều này chỉ ở trên màn hình này, không được lưu hay gửi đi
            đâu cả, và sẽ biến mất khi ngọn đèn trôi đi.
          </p>
          <label className={styles.field}>
            <span>Điều bạn muốn buông xuống (không bắt buộc)</span>
            <textarea
              value={thought}
              maxLength={MAX_LENGTH}
              rows={4}
              readOnly={phase === "releasing"}
              autoComplete="off"
              spellCheck={false}
              data-testid="lantern-thought"
              onChange={(e) => setThought(e.target.value)}
            />
          </label>
          <div className={styles.controls}>
            <button
              type="button"
              className="button"
              disabled={phase === "releasing"}
              data-testid="lantern-release"
              onClick={release}
            >
              {phase === "releasing" ? "Đèn đang trôi đi…" : "Thả đèn"}
            </button>
            <button type="button" className="button button--quiet" data-testid="lantern-exit" onClick={leave}>
              Thoát
            </button>
          </div>
        </>
      )}

      {phase === "released" && (
        <>
          <h2 className={styles.label} data-testid="lantern-released">
            Ngọn đèn đã trôi đi
          </h2>
          <p className={styles.prompt}>Điều bạn viết đã được buông xuống và không còn ở đâu cả.</p>
          {nextStep && (
            <div className={styles.next}>
              <p>Nếu muốn, bạn có thể ở lại thêm một chút:</p>
              <div className={styles.controls}>
                <Link className="button button--quiet" href={nextStep.href} data-testid="lantern-next">
                  {nextStep.label}
                </Link>
              </div>
            </div>
          )}
          <div className={styles.controls}>
            <button type="button" className="button" data-testid="lantern-exit" onClick={leave}>
              Về trang chủ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
