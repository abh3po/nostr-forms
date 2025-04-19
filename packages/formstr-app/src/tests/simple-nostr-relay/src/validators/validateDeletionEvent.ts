import type { DeletionEvent } from "@/types/nip9";
import typia from "typia";

export const validateDeletionEvent = typia.createValidate<DeletionEvent>();
