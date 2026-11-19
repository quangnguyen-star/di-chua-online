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
      <section data-testid="privacy-preferences">
        <h2>Tuỳ chọn âm thanh và giao diện</h2>
        <p>
          Lựa chọn về âm thanh và giao diện sáng hay tối chỉ được giữ trong bộ nhớ của trang khi bạn đang
          dùng, không ghi vào thiết bị và sẽ mất khi bạn đóng hoặc tải lại trang.
        </p>
      </section>
      <section data-testid="privacy-lantern">
        <h2>Lời trong đèn lồng</h2>
        <p>Điều bạn viết vào đèn lồng không bao giờ được lưu và không được gửi đi đâu.</p>
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
