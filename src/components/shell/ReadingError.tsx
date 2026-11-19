"use client";

import { ErrorState } from "./ErrorState";

/** Recoverable failure for a reading page; never logs or shows the error itself. */
export function ReadingError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Trang chưa mở được."
      body="Đã có trục trặc khi mở trang này. Bạn có thể thử mở lại."
      actions={[{ label: "Thử lại", onClick: reset }]}
    />
  );
}
