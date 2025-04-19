import type { DelegationTag } from "@/types/nip26";
import typia from "typia";

export const validateDelegationTag = typia.createValidate<DelegationTag>();
