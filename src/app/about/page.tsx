import Link from "next/link";

export const metadata = { title: "Giới thiệu" };

export default function AboutPage() {
  return (
    <>
      <h1>Giới thiệu</h1>
      <section data-testid="about-inspiration">
        <h2>Cảm hứng văn hoá</h2>
        <p>
          Đi Chùa Online lấy cảm hứng từ nếp ghé chùa quen thuộc của người Việt: bước qua cổng, đi chậm
          lại, lắng yên một lát rồi trở về với việc thường ngày.
        </p>
      </section>
      <section data-testid="about-independence">
        <h2>Độc lập với mọi ngôi chùa</h2>
        <p>
          Trang này không thuộc về, không đại diện và không được bảo trợ bởi bất kỳ ngôi chùa, tổ chức
          hay tôn giáo nào. Chúng tôi không nhận mình có liên kết với ai.
        </p>
      </section>
      <section data-testid="about-authorship">
        <h2>Tác giả nội dung</h2>
        <p>
          Các bài thực hành và lời nhắc hằng ngày do đội ngũ Đi Chùa Online tự biên soạn. Đây không phải
          lời khuyên y tế hay trị liệu.
        </p>
      </section>
      <section data-testid="about-media">
        <h2>Ghi công hình ảnh và âm thanh</h2>
        <p>
          Hình minh hoạ do đội ngũ Đi Chùa Online thực hiện. Trang không dùng âm thanh hay hình ảnh của
          bên thứ ba.
        </p>
        <p>
          Âm thanh (tiếng chuông, gió, mưa, tiếng nước) do chính trang tạo ra ngay trên thiết bị của bạn,
          không dùng bản ghi âm nào từ bên ngoài. Âm thanh là tuỳ chọn và luôn tắt theo mặc định; bạn chỉ
          nghe khi tự bật. Nguồn gốc từng hình ảnh được ghi trong tệp ASSETS.md của dự án.
        </p>
      </section>
      <section data-testid="about-calendar">
        <h2>Lịch âm</h2>
        <p>
          Bạn có thể tải tệp .ics về máy để thêm ngày rằm và mùng một vào lịch của mình. Trang chỉ cho tải
          tệp, không gửi thông báo đẩy và không nhắc bạn qua bất kỳ kênh nào.
        </p>
      </section>
      <section data-testid="about-donation">
        <h2>Không quyên góp</h2>
        <p>Trang không nhận quyên góp, không bán hàng và không đưa ra lời kêu gọi đóng góp tiền bạc.</p>
      </section>
      <p>
        <Link href="/">Về trang chủ</Link>
      </p>
    </>
  );
}
