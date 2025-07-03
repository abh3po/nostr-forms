import { Tag } from "../../../../nostr/types";
export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface AIAnalysisChatProps {
  isVisible: boolean;
  onClose: () => void;
  responsesData: Array<{ [key: string]: string }>;
  formSpec: Tag[];
}