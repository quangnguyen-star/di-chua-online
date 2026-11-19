"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Never logs the error or component stack: either could carry the visitor's intention. */
export default class VisitErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert">
        <h1>Có sự cố xảy ra</h1>
        <p>Chuyến ghé thăm đã dừng lại và không có gì được lưu. Bạn có thể bắt đầu lại.</p>
        <a href="/visit" className="button">
          Bắt đầu lại
        </a>
      </section>
    );
  }
}
