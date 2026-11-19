import Link from "next/link";

export const metadata = { title: "Giới thiệu" };

export default function AboutPage() {
  return (
    <>
      <h1>Giới thiệu</h1>
      <section>
        <h2>Những lời nhắc mang tính biểu tượng</h2>
        <p>
          Các lời nhắc và bài thực hành ở đây chỉ là những món quà mang tính biểu tượng, nhằm giúp bạn
          dừng lại và hít thở. Đây không phải là lời khuyên y tế hay trị liệu.
        </p>
      </section>
      <section>
        <h2>Thẩm định nội dung</h2>
        <p>
          Mỗi nội dung đều được một người biên tập xem xét trước khi đăng. Chỉ những nội dung đã qua
          thẩm định mới xuất hiện trên trang.
        </p>
      </section>
      <section>
        <h2>Ghi công</h2>
        <p>
          Mỗi lời nhắc đều ghi rõ nguồn. Trang không đại diện hay liên kết với bất kỳ tổ chức, tôn giáo
          hay thương hiệu nào, và không nhận quyên góp.
        </p>
      </section>
      <p>
        <Link href="/">Về trang chủ</Link>
      </p>
    </>
  );
}
