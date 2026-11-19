import { ErrorState } from "@/components/shell/ErrorState";

export default function PracticeNotFound() {
  return (
    <ErrorState
      title="Không tìm thấy bài thực hành"
      body="Bài thực hành này không tồn tại."
      actions={[{ label: "Xem các bài thực hành", href: "/practices" }]}
    />
  );
}
