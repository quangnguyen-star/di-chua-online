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
        <h2>Điều được giữ trên thiết bị</h2>
        <p>
          Trang chỉ ghi hai mục vào bộ nhớ cục bộ (localStorage) của trình duyệt bạn:
        </p>
        <ul>
          <li>
            <code>dc.word</code>: chữ bạn đã chọn trong ngày, để lần sau trang nhớ bạn đã chọn.
          </li>
          <li>
            <code>dc.incense.spent</code>: đánh dấu rằng nén hương đã cháy hết, để không thắp lại ngay.
          </li>
        </ul>
        <p>
          Hai mục này nằm trên máy bạn, không được gửi đi đâu, và bạn có thể xoá bất cứ lúc nào bằng cách
          xoá dữ liệu trang trong trình duyệt.
        </p>
      </section>
      <section data-testid="privacy-preferences">
        <h2>Tuỳ chọn âm thanh và giao diện</h2>
        <p>
          Âm thanh luôn tắt theo mặc định và chỉ bật khi bạn chọn; trang tự tạo âm thanh ngay trên thiết
          bị. Lựa chọn về âm thanh và giao diện (tự động theo giờ, ban ngày hay buổi tối) chỉ được giữ
          trong bộ nhớ của trang khi bạn đang dùng, không ghi vào thiết bị và sẽ mất khi bạn tải lại trang.
          Tệp lịch .ics chỉ được tạo và tải xuống trên máy bạn; trang không gửi thông báo đẩy.
        </p>
      </section>
      <section data-testid="privacy-lantern">
        <h2>Lời trong đèn lồng</h2>
        <p>Điều bạn viết vào đèn lồng không bao giờ được lưu, kể cả trên máy bạn, và không được gửi đi đâu.</p>
      </section>
      <section data-testid="privacy-telemetry">
        <h2>Không theo dõi cá nhân</h2>
        <p>
          Trang không có tài khoản, không dùng cookie và không dùng công cụ theo dõi của bên thứ ba. Trang
          chỉ ghi nhận các sự kiện ẩn danh dạng tổng hợp (ví dụ một bài thực hành được mở, một bước được
          xem) cùng một mã ngẫu nhiên chỉ tồn tại trong bộ nhớ của lần tải trang đó. Không có nội dung bạn
          viết nào nằm trong số này, và dữ liệu không được chia sẻ với bên nào.
        </p>
      </section>
      <p>
        <Link href="/">Về trang chủ</Link>
      </p>
    </>
  );
}
