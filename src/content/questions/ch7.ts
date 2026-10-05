import type { Question } from "./types";

const ch7: Question[] = [
  {
    id: "q7-001",
    chapterId: "ch7",
    sectionId: "s7.1",
    points: ["主触头", "辅助触头"],
    type: "single",
    stem: "在继电接触器控制电路中，用于通断主电路的是（　）。",
    options: ["辅助触头", "主触头", "按钮", "热继电器"],
    answer: "B",
    explanation:
      "主触头容量大，用于通断主电路；辅助触头容量小，用于控制电路中的自锁、互锁等逻辑。",
    difficulty: "易",
  },
  {
    id: "q7-002",
    chapterId: "ch7",
    sectionId: "s7.1",
    points: ["熔断器", "断路器"],
    type: "judge",
    stem: "熔断器熔断后可以复位，继续使用。",
    answer: "错",
    explanation:
      "熔断器熔断后必须更换熔体；断路器动作后可以手动复位，这是两者的重要区别。",
    difficulty: "易",
  },
  {
    id: "q7-003",
    chapterId: "ch7",
    sectionId: "s7.2",
    points: ["自锁", "起停控制"],
    type: "single",
    stem: "起停控制电路中，自锁触头的作用是（　）。",
    options: [
      "实现短路保护",
      "实现过载保护",
      "松开启动按钮后保持接触器线圈继续得电",
      "实现点动控制",
    ],
    answer: "C",
    explanation:
      "自锁触头与启动按钮并联，按钮松开后为线圈提供通路，使电路保持接通；没有自锁就是点动控制。",
    difficulty: "易",
  },
  {
    id: "q7-004",
    chapterId: "ch7",
    sectionId: "s7.3",
    points: ["行程控制", "限位开关"],
    type: "single",
    stem: "工作台的自动往返运动通常由（　）实现。",
    options: ["熔断器", "行程开关", "热继电器", "时间继电器"],
    answer: "B",
    explanation:
      "在两个行程终点各装一只行程开关，由挡块碰撞使之动作，配合接触器互锁即可实现自动往返。",
    difficulty: "易",
  },
  {
    id: "q7-005",
    chapterId: "ch7",
    sectionId: "s7.2",
    points: ["互锁", "正反转控制"],
    type: "judge",
    stem: "正反转控制电路中必须设置互锁，防止两个接触器同时动作造成电源短路。",
    answer: "对",
    explanation:
      "两个接触器同时闭合会造成两相电源短路，因此必须用常闭辅助触头（或按钮）互相封锁。",
    difficulty: "中",
  },
  {
    id: "q7-006",
    chapterId: "ch7",
    sectionId: "s7.3",
    points: ["保护环节", "零压保护"],
    type: "calc",
    stem: "某电动机起停控制电路要求具备短路保护和过载保护。请说明各由什么电器实现，并说明零压保护的作用。",
    answer: "短路保护由熔断器实现；过载保护由热继电器实现；零压保护由接触器自身实现",
    explanation:
      "熔断器串于主电路实现短路保护；热继电器发热元件串于主电路、常闭触头串于控制电路实现过载保护；接触器线圈失电后自动释放，恢复供电时电动机不会自行起动，即零压（失压）保护。",
    difficulty: "中",
  },
];

export default ch7;
