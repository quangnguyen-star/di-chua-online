import Link from "next/link";

export default function PracticeNotFound() {
  return (
    <div className="empty" data-testid="practice-not-found">
      <h1>Không tìm thấy bài thực hành</h1>
      <p>Bài thực hành này không tồn tại hoặc chưa được đăng.</p>
      <Link href="/practices" className="button">
        Xem các bài thực hành
      </Link>
    </div>
  );
}
