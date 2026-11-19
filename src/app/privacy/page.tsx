import Link from "next/link";

export const metadata = { title: "Quyền riêng tư" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Quyền riêng tư</h1>
      <section data-testid="privacy-anonymous">
        <h2>Ẩn danh</h2>
        <p>Bạn không cần tài khoản hay đăng nhập. Chúng tôi không biết bạn là ai.</p>
      </section>
      <section data-testid="privacy-storage">
        <h2>Không lưu trữ</h2>
        <p>
          Chúng tôi không lưu thông tin về bạn hay về buổi ghé thăm của bạn. Điều bạn nghĩ hay đặt làm ý
          định chỉ tồn tại trên màn hình của bạn trong lúc dùng trang.
        </p>
      </section>
      <section data-testid="privacy-telemetry">
        <h2>Không theo dõi</h2>
        <p>Trang không dùng công cụ theo dõi hay đo lường hành vi, và không chia sẻ dữ liệu với bên nào.</p>
      </section>
      <p>
        <Link href="/">Về trang chủ</Link>
      </p>
    </>
  );
}
