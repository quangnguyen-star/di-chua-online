import type { Practice } from "./types.ts";

const CREDIT = "Bài thực hành do đội ngũ Đi Chùa Online biên soạn, lấy cảm hứng từ cách chú ý hơi thở và cảm giác thân thể thông thường.";

export const practices: Practice[] = [
  {
    slug: "tho-2-phut",
    title: "Thở 2 phút",
    minutes: 2,
    purpose: "Dừng lại một chút giữa ngày để thân và tâm cùng có mặt ở một nơi.",
    steps: [
      "Ngồi hoặc đứng thẳng thoải mái, hai bàn chân chạm đất, vai buông lỏng.",
      "Khép mắt nhẹ hoặc nhìn xuống một điểm trước mặt.",
      "Hít vào bằng mũi, chậm rãi, và thầm biết rằng mình đang hít vào.",
      "Thở ra thật chậm, để bụng và vai chùng xuống.",
      "Khi tâm đi lạc sang việc khác, nhẹ nhàng nhận ra điều đó rồi quay về với hơi thở, không cần trách mình.",
      "Tiếp tục như vậy cho đến khi hết hai phút, rồi mở mắt và nhìn quanh một lượt.",
    ],
    openingLine: "Bây giờ mình dừng lại, chỉ cần có mặt với hơi thở.",
    closingLine: "Hai phút đã xong. Mang theo hơi thở này vào việc kế tiếp.",
    credit: CREDIT,
    timerSeconds: 120,
  },
  {
    slug: "ngoi-yen-5-phut",
    title: "Ngồi yên 5 phút",
    minutes: 5,
    purpose: "Làm quen với việc ngồi yên và quan sát những gì đang diễn ra mà không cần thay đổi nó.",
    steps: [
      "Chọn chỗ ngồi vững: ghế hoặc đệm đều được. Giữ lưng thẳng nhưng không gồng.",
      "Đặt hai tay lên đùi, thả lỏng vai, hàm và trán.",
      "Hít thở bình thường vài lần, để cơ thể lắng xuống.",
      "Chú ý nơi hơi thở rõ nhất: đầu mũi, ngực hoặc bụng. Giữ sự chú ý ở đó.",
      "Khi có âm thanh, ý nghĩ hay cảm xúc xuất hiện, chỉ cần nhận ra và gọi thầm tên nó, ví dụ \"nghe\", \"nghĩ\", rồi quay lại hơi thở.",
      "Lặp lại cho đến hết năm phút. Việc quay về nhiều lần là chính phần thực hành.",
      "Kết thúc bằng một hơi thở sâu, cử động nhẹ các ngón tay rồi mở mắt.",
    ],
    openingLine: "Năm phút này không cần làm gì thêm, chỉ ngồi và biết mình đang ngồi.",
    closingLine: "Cảm ơn bản thân đã dành năm phút ngồi yên.",
    credit: CREDIT,
    alternative: "Nếu ngồi lâu không thoải mái, bạn có thể đứng dựa lưng vào tường hoặc đi chậm vài bước, chú ý bàn chân chạm đất.",
    timerSeconds: 300,
  },
  {
    slug: "tra-3-phut",
    title: "Uống trà 3 phút",
    minutes: 3,
    purpose: "Dành vài phút chú ý trọn vẹn đến một việc rất nhỏ: một tách trà ấm.",
    steps: [
      "Pha trà theo cách bạn quen và đặt tách trước mặt.",
      "Nhìn màu nước trà và hơi nước bốc lên trong vài nhịp thở.",
      "Dùng hai tay cầm tách, cảm nhận độ ấm lan vào lòng bàn tay.",
      "Đưa tách lên gần, hít vào và để ý mùi hương.",
      "Nhấp một ngụm nhỏ, giữ lại trong miệng một lúc, để ý vị trà thay đổi thế nào.",
      "Uống chậm từng ngụm, đặt tách xuống giữa các ngụm, cho đến khi hết ba phút hoặc hết tách.",
    ],
    openingLine: "Một tách trà, một lúc chậm lại.",
    closingLine: "Tách trà đã vơi. Mang sự chậm rãi này theo mình thêm một chút.",
    credit: CREDIT,
    alternative: "Không có tách trà: rót một cốc nước ấm hoặc nước lọc và làm tương tự, hoặc chỉ xoa hai bàn tay vào nhau cho ấm rồi chú ý cảm giác trong lòng bàn tay.",
    timerSeconds: 180,
  },
];
