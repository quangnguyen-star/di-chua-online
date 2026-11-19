"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/shell/ErrorState";

type Props = { children: ReactNode };
type State = { failed: boolean };

export function VisitFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Cổng chùa đang khép."
      body="Chuyến ghé thăm đã dừng lại và không có gì được lưu. Bạn có thể thử lại hoặc xem các bài thực hành."
      actions={[
        { label: "Thử lại", onClick: onRetry },
        { label: "Các bài thực hành", href: "/practices" },
      ]}
    />
  );
}

/** Never logs the error or component stack. */
export default class VisitErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  retry = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    return <VisitFailure onRetry={this.retry} />;
  }
}
