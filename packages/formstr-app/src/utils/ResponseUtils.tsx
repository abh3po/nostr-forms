import { Event, nip44 } from "nostr-tools";
import { Field, Tag } from '../nostr/types'; 
import { getDefaultRelays } from "../nostr/common";

export const getResponseRelays = (formEvent: Event): string[] => {
  let formRelays = formEvent.tags
    .filter((r) => r[0] === "relay")
    ?.map((r) => r[1]);
  if (formRelays.length === 0) formRelays = getDefaultRelays();
  return Array.from(new Set(formRelays));
};

export const getInputsFromResponseEvent = (
  responseEvent: Event,
  editKey: string | undefined | null
): Tag[] => {
  if (responseEvent.content === "") {
    return responseEvent.tags.filter(
      (tag): tag is Tag => Array.isArray(tag) && tag[0] === "response"
    );
  } else if (editKey) {
    try {
      const conversationKey = nip44.v2.utils.getConversationKey(
        editKey,
        responseEvent.pubkey
      );
      const decryptedContent = nip44.v2.decrypt(
        responseEvent.content,
        conversationKey
      );
      const parsed = JSON.parse(decryptedContent);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (tag: Tag): tag is Tag => Array.isArray(tag) && tag[0] === "response"
        );
      }
      console.warn("Decrypted response content is not an array:", parsed);
      return [];
    } catch (e) {
      console.error("Failed to parse decrypted response content:", e);
      return [];
    }
  } else {
    console.warn("Cannot decrypt response: EditKey not available.");
    return [];
  }
};

export interface DisplayableAnswerDetail {
  questionLabel: string;
  responseLabel: string;
  fieldId: string;
}

export const processResponseInputTag = (
  inputTag: Tag,
  formSpec: Tag[] 
): DisplayableAnswerDetail => {
  const [_resPlaceholder, fieldId, answerValue, metadataString] = inputTag;
  let questionLabel = `Question ID: ${fieldId}`; 
  let responseLabel = answerValue ?? "N/A";
  const questionField = formSpec.find(
    (tag): tag is Field => tag[0] === "field" && tag[1] === fieldId
  );

  if (questionField) {
    questionLabel = questionField[3] || questionLabel; 
    if (questionField[2] === "option" && answerValue) {
      try {
        const choices = JSON.parse(questionField[4] || "[]") as Tag[];
        const selectedChoiceIds = answerValue.split(';');
        const choiceLabels = choices
          .filter(choice => selectedChoiceIds.includes(choice[0]))
          .map(choice => choice[1]);

        if (choiceLabels.length > 0) {
          responseLabel = choiceLabels.join(', ');
        }
        
        const metadata = JSON.parse(metadataString || "{}");
        if (metadata.message) {
          const otherChoice = choices.find(c => {
            try {
              return JSON.parse(c[2] || '{}')?.isOther === true;
            } catch { return false; }
          });
          if (otherChoice && selectedChoiceIds.includes(otherChoice[0])) {
            responseLabel += ` (${metadata.message})`;
          }
        }
      } catch (e) {
        console.warn("Error processing options for fieldId:", fieldId, e);
      }
    }
  }
  return { questionLabel, responseLabel, fieldId };
};