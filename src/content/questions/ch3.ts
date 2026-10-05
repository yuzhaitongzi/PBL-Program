import type { Question } from "./types";

const ch3: Question[] = [
  {
    id: "q3-001",
    chapterId: "ch3",
    sectionId: "s3.1",
    points: ["线电压与相电压", "星形联结"],
    type: "single",
    stem: "对称三相电源作星形联结，相电压为 220V，则线电压为（　）。",
    options: ["220V", "311V", "380V", "660V"],
    answer: "C",
    explanation: "对称星形联结时 UL=√3·UP≈1.732×220≈380V。",
    difficulty: "易",
  },
  {
    id: "q3-002",
    chapterId: "ch3",
    sectionId: "s3.1",
    points: ["三角形联结"],
    type: "judge",
    stem: "三相电源作三角形联结时，线电压等于相电压。",
    answer: "对",
    explanation:
      "三角形联结时每相绕组的首末端依次相连，线电压与相电压相等。",
    difficulty: "易",
  },
  {
    id: "q3-003",
    chapterId: "ch3",
    sectionId: "s3.2",
    points: ["三相四线制", "中线作用"],
    type: "single",
    stem: "三相四线制供电系统中，中线的主要作用是（　）。",
    options: [
      "提高线路电压",
      "保证不对称负载各相电压保持对称",
      "减小负载电流",
      "节约电能",
    ],
    answer: "B",
    explanation:
      "中线把负载中性点与电源中性点相连，使各相负载电压等于相电压；负载不对称时中线尤为关键。",
    difficulty: "中",
  },
  {
    id: "q3-004",
    chapterId: "ch3",
    sectionId: "s3.2",
    points: ["中线保护"],
    type: "judge",
    stem: "三相四线制的中线上不允许安装熔断器或开关。",
    answer: "对",
    explanation:
      "中线一旦断开，不对称负载会发生中性点位移，导致部分相电压过高而损坏设备。",
    difficulty: "中",
  },
  {
    id: "q3-005",
    chapterId: "ch3",
    sectionId: "s3.2",
    points: ["星形联结", "线电流与相电流"],
    type: "calc",
    stem: "对称三相负载每相阻抗 Z=10Ω，作星形联结后接在线电压为 380V 的三相电源上，求相电压、相电流和线电流。",
    answer: "UP≈220V，IP=IL=22A",
    explanation:
      "星形联结时相电压 UP=UL/√3=380/1.732≈220V；相电流 IP=UP/|Z|=220/10=22A；星形联结线电流等于相电流，即 22A。",
    difficulty: "中",
  },
];

export default ch3;
