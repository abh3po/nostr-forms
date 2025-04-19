import type { ClientToRelayPayload } from "@/types/core";
import typia from "typia";

export const validateClientToRelayPayload = typia.createValidate<ClientToRelayPayload>();
