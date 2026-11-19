import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <h1>Dừng lại một chút</h1>
      <p>Hai phút thở chậm và một lời nhắc nhỏ cho ngày hôm nay.</p>
      <div className="actions">
        <Link href="/visit" className="button" data-testid="home-visit">
          Ghé thăm 5 phút
        </Link>
        <Link href="/practices" className="button button--quiet" data-testid="home-explore">
          Khám phá các bài thực hành
        </Link>
      </div>
      <p className="muted">
        <Link href="/about">Giới thiệu</Link> · <Link href="/privacy">Quyền riêng tư</Link>
      </p>
    </>
  );
}
