import Link from "next/link";

export const metadata = { title: "Quyền riêng tư" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Quyền riêng tư</h1>
      <section>
        <h2>Ý định của bạn</h2>
        <p>
          Nếu bạn đặt một ý định cho buổi ghé thăm, ý định đó chỉ nằm trên thiết bị của bạn trong lúc
          bạn dùng trang. Chúng tôi không lưu trữ và không gửi ý định đó đi đâu cả.
        </p>
      </section>
      <section>
        <h2>Những gì chúng tôi không làm</h2>
        <p>
          Chúng tôi không yêu cầu tài khoản và không thu thập thông tin cá nhân của người truy cập.
        </p>
      </section>
      <p>
        <Link href="/">Về trang chủ</Link>
      </p>
    </>
  );
}
