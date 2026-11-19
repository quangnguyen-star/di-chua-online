"use client";

import { useState } from "react";
import { PracticeTimer } from "./PracticeTimer";
import type { PracticeKind } from "../labels";
import styles from "./TeaPreparation.module.css";

const prepSteps = [
  {
    title: "Chuẩn bị nước và tách",
    body: "Đun hoặc rót nước, chọn một tách. Không có trà cũng không sao: một cốc nước ấm hay nước lọc đều dùng được. Làm theo nhịp của bạn, không cần vội.",
  },
  {
    title: "Đặt mọi thứ trong tầm tay",
    body: "Đặt tách ở nơi bạn sẽ ngồi, kéo ghế lại gần. Nếu không có tách, bạn chỉ cần xoa hai bàn tay vào nhau cho ấm.",
  },
  {
    title: "Ngồi xuống và chậm lại",
    body: "Ngồi xuống, thả vai, thở ra một hơi dài. Khi bạn thấy sẵn sàng thì sang bước uống. Đồng hồ chưa chạy ở đây.",
  },
];

type Props = {
  slug: string;
  seconds: number;
  closingLine: string;
  kind: PracticeKind;
  next: { href: string; title: string } | null;
};

export function TeaPreparation(props: Props) {
  const [index, setIndex] = useState(0);
  const drinking = index >= prepSteps.length;
  const step = prepSteps[index];

  return (
    <div className={styles.wrap} data-testid="tea-preparation">
      {!drinking && (
        <section className={styles.panel} aria-labelledby="tea-prep-title">
          <p className="muted" data-testid="tea-prep-progress">
            Chuẩn bị, bước {index + 1} trên {prepSteps.length} (không bắt buộc)
          </p>
          <h2 id="tea-prep-title">{step.title}</h2>
          <p data-testid="tea-prep-body">{step.body}</p>
          <div className="actions">
            <button
              type="button"
              className="button"
              onClick={() => setIndex(index + 1)}
              data-testid="tea-prep-next"
            >
              Tiếp tục
            </button>
            {index > 0 && (
              <button
                type="button"
                className="button button--quiet"
                onClick={() => setIndex(index - 1)}
                data-testid="tea-prep-back"
              >
                Quay lại
              </button>
            )}
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setIndex(prepSteps.length)}
              data-testid="tea-prep-skip"
            >
              Bỏ qua, đến bước uống
            </button>
          </div>
        </section>
      )}
      {drinking && (
        <>
          <p>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setIndex(prepSteps.length - 1)}
              data-testid="tea-prep-back"
            >
              Quay lại
            </button>
          </p>
          <PracticeTimer {...props} />
        </>
      )}
    </div>
  );
}
