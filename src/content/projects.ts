import type { ProjectTriWing } from "@/lib/project";

export type ProjectTemplate = {
  id: string;
  title: string;
  drivingQuestion: string;
  scenario: string;
  chapterIds: string[];
  triWing: ProjectTriWing;
  deliverable: "report" | "slides" | "both";
  milestones: { title: string; desc: string; offsetDays: number }[];
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "tpl-dc-power",
    title: "直流稳压电源的设计与制作",
    drivingQuestion: "如何把 220V 交流电变成稳定的 5V 直流电，并且纹波足够小？",
    scenario:
      "实验室要为一批单片机开发板配电源。要求输出电压 5V、纹波小、成本低、能长时间连续工作。请你给出方案并完成关键环节的设计与验证。",
    chapterIds: ["ch1", "ch2", "ch5"],
    triWing: {
      design: "从供电需求出发，提出“变压—整流—滤波—稳压”的总体方案，并说明各环节的取舍理由。",
      engineering: "完成变压器变比、整流二极管选型、滤波电容容量、稳压电路参数的计算与验证。",
      management: "制定制作流程与测试计划，规范记录每一组实验数据。",
    },
    deliverable: "both",
    milestones: [
      {
        title: "需求分析与方案论证",
        desc: "明确输出电压、输出电流与纹波要求，提出 2~3 个可行方案并比较优缺点。",
        offsetDays: 7,
      },
      {
        title: "电路设计与参数计算",
        desc: "完成各环节的参数计算，提交计算书（含公式、代入过程与结果）。",
        offsetDays: 14,
      },
      {
        title: "制作与调试",
        desc: "搭建电路或仿真，测量空载与负载下的输出电压与纹波，记录数据。",
        offsetDays: 21,
      },
      {
        title: "总结报告",
        desc: "整理全过程，形成设计报告；并准备 5~8 分钟的汇报 PPT。",
        offsetDays: 28,
      },
    ],
  },
  {
    id: "tpl-motor-cabinet",
    title: "电动机控制柜的设计",
    drivingQuestion: "如何让一台三相异步电动机安全地正反转，并在过载时自动保护？",
    scenario:
      "某车间传送带的电动机需要频繁正反转。原来靠手动换接线，效率低、存在安全隐患。现在要改造成用按钮操作的控制柜，并要求具备短路与过载保护。",
    chapterIds: ["ch6", "ch7"],
    triWing: {
      design: "由控制要求出发，推导出主电路与控制电路的总体结构，说明保护环节的设置依据。",
      engineering: "完成接触器、热继电器、按钮等元件的选型计算与电路工作原理分析。",
      management: "规范绘制电气原理图与接线图，按调试流程逐项验证功能。",
    },
    deliverable: "both",
    milestones: [
      {
        title: "控制要求分析",
        desc: "列出全部控制要求与保护要求，明确操作方式与联锁关系。",
        offsetDays: 7,
      },
      {
        title: "主电路与控制电路设计",
        desc: "绘制主电路与控制电路原理图，说明自锁、互锁、保护环节的作用。",
        offsetDays: 14,
      },
      {
        title: "元件选型与接线调试",
        desc: "完成元件选型清单，按图接线并逐项调试，记录出现的问题与解决办法。",
        offsetDays: 21,
      },
      {
        title: "调试报告",
        desc: "整理调试过程与实测结果，形成设计报告与汇报 PPT。",
        offsetDays: 28,
      },
    ],
  },
  {
    id: "tpl-house-lighting",
    title: "家庭照明电路的设计与安装",
    drivingQuestion: "如何为一套三室两厅的住宅设计安全、经济、便于维护的照明回路？",
    scenario:
      "新房准备装修，业主要求：照明分路合理，开关位置顺手，日后某一回路检修时不影响其他回路，并且要控制预算。请给出完整的照明配电设计。",
    chapterIds: ["ch1", "ch3"],
    triWing: {
      design: "结合户型与使用习惯划分照明回路，确定开关与插座的位置。",
      engineering: "完成负荷统计、导线截面选择与保护器件的整定计算。",
      management: "规范绘制配电系统图与平面布置图，形成可交付的施工说明。",
    },
    deliverable: "both",
    milestones: [
      {
        title: "现场条件与负荷统计",
        desc: "统计各房间灯具类型与功率，计算总负荷并确定用电容量。",
        offsetDays: 7,
      },
      {
        title: "回路划分与器件选型",
        desc: "划分照明回路，选择导线截面、断路器与开关规格，说明选择依据。",
        offsetDays: 14,
      },
      {
        title: "系统图与平面图绘制",
        desc: "绘制配电系统图和各层平面布置图，标注回路编号与导线规格。",
        offsetDays: 21,
      },
      {
        title: "设计说明与方案汇报",
        desc: "编写设计说明书，说明安全措施与维护便利性，准备汇报 PPT。",
        offsetDays: 28,
      },
    ],
  },
  {
    id: "tpl-power-factor",
    title: "功率因数补偿方案设计",
    drivingQuestion: "工厂因功率因数偏低被加收电费，如何用最小成本把功率因数提高到考核值以上？",
    scenario:
      "某工厂负载以三相异步电动机为主，总有功功率约 200kW，平均功率因数 0.65。供电部门要求功率因数提高到 0.9 以上，否则加收电费。请你给出补偿方案与投资回报测算。",
    chapterIds: ["ch2"],
    triWing: {
      design: "分析无功缺口的来源与分布，提出并联电容补偿的总体方案。",
      engineering: "计算所需补偿容量，完成电容器组容量分配与接线设计。",
      management: "做投入产出测算，形成提交给厂方的书面建议。",
    },
    deliverable: "report",
    milestones: [
      {
        title: "现状分析与数据核算",
        desc: "计算现有视在功率、无功功率与功率因数，明确需要补偿的无功缺口。",
        offsetDays: 7,
      },
      {
        title: "补偿容量计算",
        desc: "按目标功率因数计算所需补偿容量，并说明计算依据。",
        offsetDays: 14,
      },
      {
        title: "电容器选型与接线方案",
        desc: "选择电容器规格与分组方式，绘制补偿接线图，说明投切控制方式。",
        offsetDays: 21,
      },
      {
        title: "经济效益分析与建议书",
        desc: "测算设备投资、可节省的电费与回收周期，形成建议书。",
        offsetDays: 28,
      },
    ],
  },
  {
    id: "tpl-temp-alarm",
    title: "温度监测报警装置",
    drivingQuestion: "如何设计一个能在温度超过设定值时自动报警的电路？",
    scenario:
      "某设备需要长期运行，温度超过 60°C 必须及时报警。要求电路简单可靠，报警带一定延时以避免瞬时波动造成误报。",
    chapterIds: ["ch1", "ch4"],
    triWing: {
      design: "提出“传感—比较—延时—报警”的总体方案，说明各环节的作用。",
      engineering: "完成分压、比较电路与 RC 延时环节的参数计算与验证。",
      management: "记录调试过程与阈值整定数据，形成完整规范的测试报告。",
    },
    deliverable: "report",
    milestones: [
      {
        title: "方案设计与元件选择",
        desc: "确定温度传感方式与报警方式，列出所需元件清单。",
        offsetDays: 7,
      },
      {
        title: "电路参数计算",
        desc: "计算比较阈值、分压电阻与 RC 延时时间常数，说明取值理由。",
        offsetDays: 14,
      },
      {
        title: "制作与阈值调试",
        desc: "搭建电路，整定报警阈值与延时时间，记录实测数据。",
        offsetDays: 21,
      },
      {
        title: "测试报告",
        desc: "整理测试数据与误差分析，形成设计报告。",
        offsetDays: 28,
      },
    ],
  },
];

export function templateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}
