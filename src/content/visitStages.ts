import type { VisitStage } from "./types.ts";

export const visitStages: VisitStage[] = [
  { id: "gate", label: "Cổng", seconds: 30, prompt: "Dừng lại trước cổng. Thở chậm một nhịp và để những việc bên ngoài ở lại phía sau." },
  { id: "courtyard", label: "Sân", seconds: 60, prompt: "Bước chậm qua sân. Chú ý bàn chân chạm đất, ánh sáng và âm thanh xung quanh." },
  { id: "hall", label: "Chánh điện", seconds: 180, prompt: "Ngồi yên hoặc đứng lặng, giữ sự chú ý nơi hơi thở. Khi tâm đi lạc, nhẹ nhàng quay về." },
  { id: "return", label: "Trở ra", seconds: 30, prompt: "Hít một hơi sâu rồi bước ra chậm rãi, mang theo sự yên ổn này vào phần còn lại của ngày." },
];
