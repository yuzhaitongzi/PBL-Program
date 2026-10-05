export type QuestionType = "single" | "multiple" | "judge" | "calc";

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single: "单选题",
  multiple: "多选题",
  judge: "判断题",
  calc: "计算题",
};

export type Difficulty = "易" | "中" | "难";

export type Question = {
  id: string;
  chapterId: string;
  sectionId: string;
  /** 对应知识点标签 */
  points: string[];
  type: QuestionType;
  stem: string;
  /** 选择题选项，判断题与计算题可为空 */
  options?: string[];
  /** 选择题填 A/B/C…，判断题填「对」「错」，计算题填解答要点 */
  answer: string;
  explanation: string;
  difficulty: Difficulty;
  /** 题目来源，可编辑 */
  source?: string;
  /** 拍照上传的图片（压缩后的 dataURL） */
  images?: string[];
};

export const DEFAULT_SOURCE = "课程组自编";

export const DIFFICULTIES: Difficulty[] = ["易", "中", "难"];
