import type { VisitStage, VisitStageId } from "./types.ts";
import { routes } from "./routes.ts";

const stop = (
  id: VisitStageId,
  label: string,
  activity: string,
  seconds: number,
  prompt: string,
): VisitStage => ({
  id,
  label,
  seconds,
  prompt,
  activity,
  config: { seconds },
  href: routes.find((r) => r.id === id)?.href ?? "/",
});

/** Six stops over the six places: 30 + 45 + 30 + 120 + 45 + 30 = 300 active seconds. */
export const visitStages: VisitStage[] = [
  stop("gate", "Cổng chùa", "breathing", 30, "Dừng lại trước cổng. Thở chậm một nhịp và để những việc bên ngoài ở lại phía sau."),
  stop("courtyard", "Sân chùa", "sweeping", 45, "Bước chậm qua sân. Chú ý bàn chân chạm đất, tiếng chổi và ánh sáng xung quanh."),
  stop("hall", "Chánh điện", "incense", 30, "Thắp một nén hương trong tâm, giữ sự chú ý nơi hơi thở. Khi tâm đi lạc, nhẹ nhàng quay về."),
  stop("pond", "Bến sông", "lantern", 120, "Ngồi bên mặt nước. Để một ý nghĩ trôi đi theo ngọn đèn; ý nghĩ ấy chỉ ở lại trong bạn."),
  stop("veranda", "Hiên chùa", "tea", 45, "Cầm chén trà bằng hai tay, nhấp chậm từng ngụm và nghe tiếng gió."),
  stop("outside", "Bên ngoài", "word", 30, "Hít một hơi sâu rồi bước ra chậm rãi, mang theo sự yên ổn này vào phần còn lại của ngày."),
];
