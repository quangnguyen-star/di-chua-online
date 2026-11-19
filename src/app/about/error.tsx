"use client";

import { ReadingError } from "@/components/shell/ReadingError";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ReadingError reset={reset} />;
}
