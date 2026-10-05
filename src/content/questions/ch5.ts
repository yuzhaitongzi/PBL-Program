import type { Question } from "./types";

const ch5: Question[] = [
  {
    id: "q5-001",
    chapterId: "ch5",
    sectionId: "s5.1",
    points: ["磁导率", "铁磁材料"],
    type: "single",
    stem: "铁磁材料的磁导率 μ 具有的特点是（　）。",
    options: [
      "是恒定常数",
      "随磁场强度变化，具有非线性",
      "恒等于真空磁导率",
      "与磁场强度无关",
    ],
    answer: "B",
    explanation:
      "铁磁材料的 μ 随磁场强度变化，存在磁饱和现象，因此磁路一般是非线性的。",
    difficulty: "中",
  },
  {
    id: "q5-002",
    chapterId: "ch5",
    sectionId: "s5.1",
    points: ["变压器原理"],
    type: "judge",
    stem: "变压器既可以变换交流电压，也可以变换直流电压。",
    answer: "错",
    explanation:
      "变压器依靠交变磁通感应电动势工作。直流下磁通恒定，副绕组不产生感应电动势，因此不能变换直流。",
    difficulty: "易",
  },
  {
    id: "q5-003",
    chapterId: "ch5",
    sectionId: "s5.2",
    points: ["磁路欧姆定律"],
    type: "single",
    stem: "磁路欧姆定律的表达式为（　）。",
    options: ["Φ=F/Rm", "Φ=F·Rm", "Φ=Rm/F", "Φ=F+Rm"],
    answer: "A",
    explanation:
      "磁通等于磁动势与磁阻之比，Φ=F/Rm，其中 F=NI、Rm=l/(μS)。",
    difficulty: "易",
  },
  {
    id: "q5-004",
    chapterId: "ch5",
    sectionId: "s5.2",
    points: ["漏磁"],
    type: "judge",
    stem: "实际磁路中的漏磁很小，计算时可以完全忽略。",
    answer: "错",
    explanation:
      "漏磁确实较小，但在要求较高的场合必须考虑，否则计算结果偏差较大。",
    difficulty: "中",
  },
  {
    id: "q5-005",
    chapterId: "ch5",
    sectionId: "s5.3",
    points: ["铁损", "磁滞损耗", "涡流损耗"],
    type: "single",
    stem: "交流铁心线圈的铁损由（　）组成。",
    options: [
      "铜损和铁损",
      "磁滞损耗和涡流损耗",
      "只有涡流损耗",
      "只有磁滞损耗",
    ],
    answer: "B",
    explanation:
      "铁损包括磁滞损耗与涡流损耗；铜损属于线圈电阻的损耗，不计入铁损。",
    difficulty: "易",
  },
  {
    id: "q5-006",
    chapterId: "ch5",
    sectionId: "s5.4",
    points: ["电压变换"],
    type: "single",
    stem: "变压器一次绕组 500 匝、二次绕组 100 匝，一次电压 220V，则二次电压为（　）。",
    options: ["44V", "1100V", "22V", "55V"],
    answer: "A",
    explanation: "U₂=U₁·N₂/N₁=220×100/500=44V。",
    difficulty: "易",
  },
  {
    id: "q5-007",
    chapterId: "ch5",
    sectionId: "s5.4",
    points: ["电压比", "绕组匝数"],
    type: "calc",
    stem: "一台单相变压器 U₁=220V、U₂=36V，一次绕组 N₁=1100 匝，求电压比与二次绕组匝数。",
    answer: "k≈6.11，N₂≈180 匝",
    explanation: "电压比 k=U₁/U₂=220/36≈6.11；N₂=N₁/k=1100/6.11≈180 匝。",
    difficulty: "中",
  },
];

export default ch5;
