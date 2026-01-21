import { NormalizedForm } from "../types";

export function stripHtml(input: string | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "") // remove all HTML tags
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
}

export function getOrderedFieldIds(form: NormalizedForm): string[] {
  if (!form.sections || form.sections.length === 0) {
    return form.fieldOrder;
  }

  return [...form.sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((section) => section.questionIds);
}
