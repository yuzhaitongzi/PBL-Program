import { EMPTY_RESOURCE, type SectionResource } from "@/content/course";
import ch1 from "./ch1";
import ch2 from "./ch2";
import ch3 from "./ch3";
import ch4 from "./ch4";
import ch5 from "./ch5";
import ch6 from "./ch6";
import ch7 from "./ch7";
import ch8 from "./ch8";

/** 默认（内置）资源内容，可被教师端编辑后覆盖 */
export const defaultResources: Record<string, SectionResource> = {
  ...ch1,
  ...ch2,
  ...ch3,
  ...ch4,
  ...ch5,
  ...ch6,
  ...ch7,
  ...ch8,
};

export function getDefaultResource(sectionId: string): SectionResource {
  const r = defaultResources[sectionId];
  if (!r) return EMPTY_RESOURCE;
  return {
    points: [...r.points],
    example: { ...r.example },
    pitfalls: [...r.pitfalls],
    case: { ...r.case },
  };
}

export const SEEDED_SECTION_COUNT = Object.keys(defaultResources).length;
