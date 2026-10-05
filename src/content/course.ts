/**
 * 《电工技术》课程内容结构
 *
 * 数据来源：教材目录（前言 + 第 1~8 章）
 * 说明：这一层只描述「内容骨架」，四类资源（知识点/例题/易错点/案例）
 * 挂在最细粒度的「节」上，见 src/content/resources。
 */

export type Wing = "design" | "engineering" | "management";

export const WING_LABEL: Record<Wing, { name: string; short: string; desc: string }> = {
  design: {
    name: "设计翼",
    short: "设计",
    desc: "问题识别与方案构想",
  },
  engineering: {
    name: "工程翼",
    short: "工程",
    desc: "分析建模与实验验证",
  },
  management: {
    name: "管理翼",
    short: "管理",
    desc: "流程组织、规范表达与团队协作",
  },
};

export type Subsection = { id: string; title: string };

export type Section = {
  id: string;
  title: string;
  subsections: Subsection[];
};

export type Chapter = {
  id: string;
  no: number;
  title: string;
  sections: Section[];
  exercise?: string;
};

export const chapters: Chapter[] = [
  {
    id: "ch1",
    no: 1,
    title: "电路基本概念、基本定律和直流电路的分析",
    exercise: "习题1",
    sections: [
      {
        id: "s1.1",
        title: "电路和电路模型",
        subsections: [
          { id: "s1.1.1", title: "电路的作用和基本组成" },
          { id: "s1.1.2", title: "电路模型" },
        ],
      },
      {
        id: "s1.2",
        title: "电路基本物理量及其表示",
        subsections: [
          { id: "s1.2.1", title: "电流和电流的参考方向" },
          { id: "s1.2.2", title: "电压和电压的参考方向" },
          { id: "s1.2.3", title: "参考方向的关联与非关联" },
          { id: "s1.2.4", title: "电阻、电导和欧姆定律" },
          { id: "s1.2.5", title: "电功率及其计算公式" },
        ],
      },
      {
        id: "s1.3",
        title: "基本电路元件",
        subsections: [
          { id: "s1.3.1", title: "电阻元件" },
          { id: "s1.3.2", title: "电感元件" },
          { id: "s1.3.3", title: "电容元件" },
          { id: "s1.3.4", title: "理想电压源" },
          { id: "s1.3.5", title: "理想电流源" },
          { id: "s1.3.6", title: "受控电压源" },
          { id: "s1.3.7", title: "受控电流源" },
        ],
      },
      {
        id: "s1.4",
        title: "基尔霍夫定律",
        subsections: [
          { id: "s1.4.1", title: "基尔霍夫电流定律" },
          { id: "s1.4.2", title: "基尔霍夫电压定律" },
        ],
      },
      {
        id: "s1.5",
        title: "直流电路的分析方法",
        subsections: [
          { id: "s1.5.1", title: "电位及电位的计算" },
          { id: "s1.5.2", title: "支路电流法" },
          { id: "s1.5.3", title: "节点电位法" },
          { id: "s1.5.4", title: "电阻等效变换法" },
          { id: "s1.5.5", title: "电源等效变换法" },
          { id: "s1.5.6", title: "叠加定理" },
          { id: "s1.5.7", title: "戴维南定理" },
          { id: "s1.5.8", title: "诺顿定理" },
          { id: "s1.5.9", title: "含受控电源的电路分析" },
        ],
      },
    ],
  },
  {
    id: "ch2",
    no: 2,
    title: "正弦交流电路",
    exercise: "习题2",
    sections: [
      {
        id: "s2.1",
        title: "有关复数的基础知识",
        subsections: [
          { id: "s2.1.1", title: "复数的概念和复数的表示方式" },
          { id: "s2.1.2", title: "复数的性质和加减乘除运算" },
        ],
      },
      {
        id: "s2.2",
        title: "正弦交流电的基本概念",
        subsections: [
          { id: "s2.2.1", title: "正弦量三要素" },
          { id: "s2.2.2", title: "正弦交流电的相量表示法" },
        ],
      },
      {
        id: "s2.3",
        title: "单一参数的正弦交流电路",
        subsections: [
          { id: "s2.3.1", title: "电阻元件的正弦交流电路" },
          { id: "s2.3.2", title: "电感元件的正弦交流电路" },
          { id: "s2.3.3", title: "电容元件的正弦交流电路" },
        ],
      },
      {
        id: "s2.4",
        title: "基尔霍夫定律的相量形式",
        subsections: [],
      },
      {
        id: "s2.5",
        title: "一般正弦交流电路的分析",
        subsections: [
          { id: "s2.5.1", title: "阻抗" },
          { id: "s2.5.2", title: "阻抗的等效变换" },
          { id: "s2.5.3", title: "一般正弦交流电路的分析" },
        ],
      },
      {
        id: "s2.6",
        title: "正弦交流电路的功率和功率因数",
        subsections: [
          { id: "s2.6.1", title: "瞬时功率" },
          { id: "s2.6.2", title: "有功功率" },
          { id: "s2.6.3", title: "无功功率" },
          { id: "s2.6.4", title: "视在功率" },
          { id: "s2.6.5", title: "功率因数" },
        ],
      },
      {
        id: "s2.7",
        title: "简单正弦交流电路——RLC 串联电路",
        subsections: [
          { id: "s2.7.1", title: "串联电路中电压和电流的关系" },
          { id: "s2.7.2", title: "RLC 串联电路的功率" },
          { id: "s2.7.3", title: "RLC 串联电路的相量图分析法" },
        ],
      },
      {
        id: "s2.8",
        title: "正弦交流电路的谐振",
        subsections: [
          { id: "s2.8.1", title: "串联谐振" },
          { id: "s2.8.2", title: "并联谐振" },
        ],
      },
      {
        id: "s2.9",
        title: "正弦交流电路功率因数的提高",
        subsections: [
          { id: "s2.9.1", title: "提高功率因数的意义" },
          { id: "s2.9.2", title: "提高功率因数的方法" },
        ],
      },
    ],
  },
  {
    id: "ch3",
    no: 3,
    title: "三相正弦交流电路",
    exercise: "习题3",
    sections: [
      {
        id: "s3.1",
        title: "三相正弦交流电源",
        subsections: [
          { id: "s3.1.1", title: "三相电源的产生" },
          { id: "s3.1.2", title: "三相电源的连接" },
        ],
      },
      {
        id: "s3.2",
        title: "三相负载电路",
        subsections: [
          { id: "s3.2.1", title: "三相负载星形联结" },
          { id: "s3.2.2", title: "三相负载三角形联结" },
          { id: "s3.2.3", title: "三相负载在三相电路中的连接原则" },
        ],
      },
    ],
  },
  {
    id: "ch4",
    no: 4,
    title: "一阶线性电路的暂态分析",
    exercise: "习题4",
    sections: [
      {
        id: "s4.1",
        title: "电路暂态过程和一阶线性电路的暂态过程",
        subsections: [
          { id: "s4.1.1", title: "电路暂态过程" },
          { id: "s4.1.2", title: "一阶线性电路的暂态过程" },
        ],
      },
      {
        id: "s4.2",
        title: "电路换路与换路定则",
        subsections: [
          { id: "s4.2.1", title: "电路换路" },
          { id: "s4.2.2", title: "换路定则" },
        ],
      },
      {
        id: "s4.3",
        title: "暂态电路初始值与稳态值的确定",
        subsections: [
          { id: "s4.3.1", title: "暂态电路初始值的确定" },
          { id: "s4.3.2", title: "暂态电路稳态值的确定" },
        ],
      },
      { id: "s4.4", title: "RC 电路暂态过程分析", subsections: [] },
      { id: "s4.5", title: "RL 电路暂态过程分析", subsections: [] },
      { id: "s4.6", title: "一阶线性电路暂态过程的三要素法", subsections: [] },
      {
        id: "s4.7",
        title: "RC 微分电路和 RC 积分电路",
        subsections: [
          { id: "s4.7.1", title: "RC 微分电路" },
          { id: "s4.7.2", title: "RC 积分电路" },
        ],
      },
    ],
  },
  {
    id: "ch5",
    no: 5,
    title: "磁路和变压器",
    exercise: "习题5",
    sections: [
      {
        id: "s5.1",
        title: "磁场的基本物理量和磁性材料的磁性能",
        subsections: [
          { id: "s5.1.1", title: "磁场的基本物理量" },
          { id: "s5.1.2", title: "磁性材料的磁性能" },
        ],
      },
      {
        id: "s5.2",
        title: "磁路和磁路分析",
        subsections: [
          { id: "s5.2.1", title: "磁路" },
          { id: "s5.2.2", title: "磁路分析" },
        ],
      },
      {
        id: "s5.3",
        title: "铁心线圈电路分析",
        subsections: [
          { id: "s5.3.1", title: "直流铁心线圈电路分析" },
          { id: "s5.3.2", title: "交流铁心线圈电路分析" },
        ],
      },
      {
        id: "s5.4",
        title: "变压器",
        subsections: [
          { id: "s5.4.1", title: "变压器的基本结构" },
          { id: "s5.4.2", title: "变压器的工作原理" },
          { id: "s5.4.3", title: "变压器的电压变换" },
          { id: "s5.4.4", title: "变压器的电流变换" },
          { id: "s5.4.5", title: "变压器的阻抗变换" },
          { id: "s5.4.6", title: "变压器绕组的极性" },
          { id: "s5.4.7", title: "变压器的铭牌数据" },
        ],
      },
    ],
  },
  {
    id: "ch6",
    no: 6,
    title: "交流电动机",
    exercise: "习题6",
    sections: [
      { id: "s6.1", title: "电动机概述", subsections: [] },
      { id: "s6.2", title: "三相异步电动机的基本结构", subsections: [] },
      {
        id: "s6.3",
        title: "三相异步电动机的转动原理",
        subsections: [
          { id: "s6.3.1", title: "旋转磁场的产生" },
          { id: "s6.3.2", title: "三相异步电动机的转动原理与转速、转差率" },
        ],
      },
      {
        id: "s6.4",
        title: "三相异步电动机的电路分析",
        subsections: [
          { id: "s6.4.1", title: "定子电路" },
          { id: "s6.4.2", title: "转子电路" },
        ],
      },
      {
        id: "s6.5",
        title: "三相异步电动机的电磁转矩与机械特性",
        subsections: [
          { id: "s6.5.1", title: "电磁转矩" },
          { id: "s6.5.2", title: "机械特性" },
          { id: "s6.5.3", title: "电动机的各种转矩与转动" },
        ],
      },
      { id: "s6.6", title: "三相异步电动机的铭牌数据", subsections: [] },
      {
        id: "s6.7",
        title: "三相异步电动机的起动、调速和制动",
        subsections: [
          { id: "s6.7.1", title: "三相异步电动机的起动" },
          { id: "s6.7.2", title: "三相异步电动机的调速" },
          { id: "s6.7.3", title: "三相异步电动机的制动" },
        ],
      },
    ],
  },
  {
    id: "ch7",
    no: 7,
    title: "继电接触器控制系统",
    exercise: "习题7",
    sections: [
      {
        id: "s7.1",
        title: "常用控制电器",
        subsections: [
          { id: "s7.1.1", title: "开关" },
          { id: "s7.1.2", title: "按钮" },
          { id: "s7.1.3", title: "熔断器" },
          { id: "s7.1.4", title: "断路器" },
          { id: "s7.1.5", title: "接触器" },
          { id: "s7.1.6", title: "继电器" },
        ],
      },
      {
        id: "s7.2",
        title: "三相异步电动机的继电接触器基本控制电路",
        subsections: [
          { id: "s7.2.1", title: "单台三相异步电动机的起停控制电路" },
          { id: "s7.2.2", title: "单台三相异步电动机的正反转控制电路" },
          { id: "s7.2.3", title: "单台三相异步电动机的 Y-△ 起动控制电路" },
          { id: "s7.2.4", title: "多台电动机的顺序控制电路" },
        ],
      },
      {
        id: "s7.3",
        title: "一般继电接触器控制电路的设计和保护",
        subsections: [
          { id: "s7.3.1", title: "行程控制" },
          { id: "s7.3.2", title: "异地控制同一设备" },
          { id: "s7.3.3", title: "一般点动控制电路及其改进" },
        ],
      },
    ],
  },
  {
    id: "ch8",
    no: 8,
    title: "可编程序逻辑控制器及其应用",
    sections: [
      { id: "s8.1", title: "可编程序逻辑控制器的发展", subsections: [] },
      { id: "s8.2", title: "PLC 的基本结构", subsections: [] },
      { id: "s8.3", title: "PLC 的基本工作原理", subsections: [] },
      { id: "s8.4", title: "PLC 的主要性能指标", subsections: [] },
      { id: "s8.5", title: "PLC 的编程语言", subsections: [] },
      {
        id: "s8.6",
        title: "三菱 FX 系列 PLC 基本的编程单元和指令系统",
        subsections: [
          { id: "s8.6.1", title: "基本的编程单元" },
          { id: "s8.6.2", title: "基本的指令系统" },
        ],
      },
      {
        id: "s8.7",
        title: "PLC 程序的基本设计方法",
        subsections: [
          { id: "s8.7.1", title: "基于梯形图的经验设计法" },
          { id: "s8.7.2", title: "基于继电接触器控制电路的转换设计法" },
          { id: "s8.7.3", title: "基于功能块图或梯形图的逻辑设计法" },
          { id: "s8.7.4", title: "基于顺序功能图或梯形图的顺序控制设计法" },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 模块划分                                                            */
/* ------------------------------------------------------------------ */

export type ModuleDef = {
  id: string;
  name: string;
  /** 申报书里的模块顺序 */
  order: number;
  summary: string;
  wingFocus: Wing[];
  /** 覆盖的章 */
  chapterIds: string[];
  /**
   * 若给出，则只取这些"节"，用于把第 1 章拆成两个模块。
   * 为空表示整章。
   */
  sectionIds?: string[];
};

/**
 * 默认模块划分。
 *
 * 注意：申报书原文的第五个模块写作「实验实践与综合 PBL 项目」，
 * 而教材第 5~8 章（磁路与变压器、交流电动机、继电接触器、PLC）是应用章节。
 * 这里先把第 5~8 章归入模块五，模块名与归属都可以在方案确认后调整。
 */
export const modules: ModuleDef[] = [
  {
    id: "m1",
    name: "电路基本概念与定律",
    order: 1,
    summary: "电路模型、基本物理量与参考方向、基本元件、基尔霍夫定律",
    wingFocus: ["design", "engineering"],
    chapterIds: ["ch1"],
    sectionIds: ["s1.1", "s1.2", "s1.3", "s1.4"],
  },
  {
    id: "m2",
    name: "直流电路分析方法",
    order: 2,
    summary: "支路电流法、节点电位法、等效变换、叠加与戴维南定理",
    wingFocus: ["engineering"],
    chapterIds: ["ch1"],
    sectionIds: ["s1.5"],
  },
  {
    id: "m3",
    name: "正弦交流电路",
    order: 3,
    summary: "相量法、阻抗、功率与功率因数、谐振、三相交流电路",
    wingFocus: ["engineering"],
    chapterIds: ["ch2", "ch3"],
  },
  {
    id: "m4",
    name: "一阶线性电路暂态分析",
    order: 4,
    summary: "换路定则、初始值与稳态值、RC/RL 暂态过程、三要素法",
    wingFocus: ["engineering", "design"],
    chapterIds: ["ch4"],
  },
  {
    id: "m5",
    name: "磁路、电机与电气控制",
    order: 5,
    summary: "磁路与变压器、交流电动机、继电接触器控制、PLC 应用",
    wingFocus: ["engineering", "management"],
    chapterIds: ["ch5", "ch6", "ch7", "ch8"],
  },
];

/* ------------------------------------------------------------------ */
/* 专业变体                                                            */
/* ------------------------------------------------------------------ */

export type MajorConfig = {
  id: string;
  name: string;
  /** 可见章节，按教材顺序 */
  chapterIds: string[];
  /** 该专业可选的难度层 */
  level: "A" | "B";
  note?: string;
};

export const defaultMajors: MajorConfig[] = [
  {
    id: "mechatronics",
    name: "机电类",
    chapterIds: ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7"],
    level: "A",
    note: "要求较高，覆盖到第 7 章继电接触器控制系统",
  },
  {
    id: "chem-material",
    name: "化工材料类",
    chapterIds: ["ch1", "ch2", "ch3", "ch4", "ch5"],
    level: "B",
    note: "要求较低，覆盖到第 5 章磁路和变压器",
  },
];

/* ------------------------------------------------------------------ */
/* 查询辅助                                                            */
/* ------------------------------------------------------------------ */

export const chapterById = new Map(chapters.map((c) => [c.id, c]));

export const moduleById = new Map(modules.map((m) => [m.id, m]));

export function chapterTitle(id: string): string {
  const c = chapterById.get(id);
  return c ? `第 ${c.no} 章　${c.title}` : id;
}

/** 课程总节数（用于进度显示） */
export function countSections(chapterIdList: string[]): number {
  return chapters
    .filter((c) => chapterIdList.includes(c.id))
    .reduce((sum, c) => sum + c.sections.length, 0);
}

/** 某模块在给定可见章节范围内实际包含的节 */
export function moduleSections(mod: ModuleDef, visibleChapterIds: string[]): Section[] {
  const out: Section[] = [];
  for (const cid of mod.chapterIds) {
    if (!visibleChapterIds.includes(cid)) continue;
    const ch = chapterById.get(cid);
    if (!ch) continue;
    for (const s of ch.sections) {
      if (mod.sectionIds && !mod.sectionIds.includes(s.id)) continue;
      out.push(s);
    }
  }
  return out;
}

/** 某章节在给定可见范围内属于哪些模块 */
export function modulesForSection(sectionId: string, visibleChapterIds: string[]): ModuleDef[] {
  return modules.filter((m) =>
    moduleSections(m, visibleChapterIds).some((s) => s.id === sectionId),
  );
}

export const RESOURCE_KINDS = [
  { key: "point", name: "知识点", desc: "以标签形式列出本节的核心概念与公式" },
  { key: "example", name: "例题", desc: "一道典型例题及解析" },
  { key: "pitfall", name: "易错点", desc: "常见错误与辨析" },
  { key: "case", name: "案例", desc: "工程案例与应用情境" },
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number]["key"];

/** 每一节的四类资源内容 */
export type SectionResource = {
  /** 知识点标签 */
  points: string[];
  /** 例题 */
  example: { title: string; solution: string };
  /** 易错点 */
  pitfalls: string[];
  /** 案例 */
  case: { title: string; body: string };
};

export const EMPTY_RESOURCE: SectionResource = {
  points: [],
  example: { title: "", solution: "" },
  pitfalls: [],
  case: { title: "", body: "" },
};

/** 课程关系图节点（形式类，链接可在教师端配置） */
export type CourseNode = {
  id: string;
  name: string;
  relation: "self" | "prerequisite" | "follow-up" | "related";
  desc: string;
  url?: string;
};

export const courseGraph: CourseNode[] = [
  {
    id: "et",
    name: "电工技术",
    relation: "self",
    desc: "本课程。电路基本理论、交流电路、暂态分析与电气控制。",
  },
  {
    id: "electronics",
    name: "电子技术",
    relation: "follow-up",
    desc: "二极管、三极管与基本放大电路。需要本课程的电路分析方法。",
  },
  {
    id: "analog",
    name: "模拟电子技术",
    relation: "follow-up",
    desc: "放大、反馈、运放与电源电路。依赖正弦交流与阻抗概念。",
  },
  {
    id: "digital",
    name: "数字电子技术",
    relation: "related",
    desc: "逻辑门、组合与时序逻辑。与本课程 PLC 部分衔接。",
  },
  {
    id: "signals",
    name: "信号与系统",
    relation: "follow-up",
    desc: "信号的频域分析与系统响应。依赖相量与暂态分析基础。",
  },
  {
    id: "physics",
    name: "大学物理",
    relation: "prerequisite",
    desc: "电磁学基础。本课程的前置课程。",
  },
];
