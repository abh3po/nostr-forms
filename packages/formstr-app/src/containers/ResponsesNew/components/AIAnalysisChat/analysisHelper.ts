import { ollamaService } from "../../../../services/ollamaService";
import { Field, Tag } from "../../../../nostr/types";
import { Message } from "./types";

const createFieldMap = (formSpec: Tag[]): Map<string, Field> => {
    const map = new Map<string, Field>();
    const fields = formSpec.filter(tag => tag[0] === 'field') as Field[];
    fields.forEach(field => {
        const label = field[3];
        map.set(label, field);
    });
    return map;
};
export const createAnalysisReport = (responses: Array<{ [key: string]: any }>, formSpec: Tag[]): string => {
  if (!responses || responses.length === 0) {
    return "No response data available.";
  }
  const fieldMap = createFieldMap(formSpec);
  const metadataKeys = ['key', 'createdAt', 'authorPubkey', 'responsesCount'];
  const questionHeaders = [...new Set(responses.flatMap(res => Object.keys(res)))].filter(key => !metadataKeys.includes(key));
  const totalResponses = responses.length;
  let summarySection = `## High-Level Summary\n- Total Submissions: ${totalResponses}\n`;
  const optionCounts: { [question: string]: { [option: string]: number } } = {};
  for (const question of questionHeaders) {
    const field = fieldMap.get(question);
    if (!field) continue;
    let config = { renderElement: '' };
    try {
        config = { ...config, ...JSON.parse(field[5]) };
    } catch (e) { console.error("Could not parse field config"); }
    if (config.renderElement === 'radioButton' || config.renderElement === 'checkboxes') {
        const allAnswers = responses.map(res => res[question]).filter(val => val !== null && val !== undefined && val !== '');
        if (allAnswers.length === 0) continue;
        optionCounts[question] = {};
        let flatAnswers;
        if (config.renderElement === 'checkboxes') {
            flatAnswers = allAnswers.flatMap(ans => String(ans).split(',').map(s => s.trim()));
        } else {
            flatAnswers = allAnswers.map(ans => String(ans).trim());
        }
        for (const answer of flatAnswers) {
            optionCounts[question][answer] = (optionCounts[question][answer] || 0) + 1;
        }
    }
  }
  let breakdownSection = `## Choice-Based Question Analysis\n`;
  if (Object.keys(optionCounts).length > 0) {
    for (const [question, counts] of Object.entries(optionCounts)) {
      breakdownSection += `- **${question}**:\n`;
      for (const [option, count] of Object.entries(counts)) {
        const percentage = ((count / totalResponses) * 100).toFixed(2);
        breakdownSection += `  - ${option}: ${count} selection(s) (${percentage}%)\n`;
      }
    }
  } else {
    breakdownSection += "No choice-based questions were answered.\n";
  }
  const headers = ['Submission', ...questionHeaders];
  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rows = responses.map((res, index) => {
    const rowData = [`Submission ${index + 1}`, ...questionHeaders.map(header => String(res[header] || 'N/A').trim().replace(/\|/g, '\\|'))];
    return `| ${rowData.join(' | ')} |`;
  });
  const tableSection = `## Full Raw Data Table\n${[headerLine, separatorLine, ...rows].join('\n')}`;
  return `${summarySection}\n${breakdownSection}\n${tableSection}`;
};


interface AnalysisParams {
    query: string;
    historyText: string;
    trueData: string;
    modelName?: string;
}

const generateDraftAnswer = async ({ query, historyText, trueData, modelName }: AnalysisParams) => {
    const systemPrompt = `You are a data analyst. Using the TRUE_DATA, generate a very small and strightforward analysis of important things. NO EXTRA TEXT OR INSIGHT. Do not mention about TRUE_DATA, QUERY in the response. Do not print the entire TRUE_DATA.

    TRUE_DATA :
    ${trueData}
    
    `;
    const result = await ollamaService.generate({ system: systemPrompt, prompt: query, modelName });
    
    if (!result.success || !result.data?.response) {
        throw new Error(result.error || "Failed to generate initial response.");
    }
    return result;
};

const refineAndCorrectAnswer = async ({ query, trueData, modelName, draftAnswer }: AnalysisParams & { draftAnswer: string }, onData?: (chunk: any) => void) => {
    const systemPrompt = `You are a fact-checker. check the DRAFT_ANSWER using the TRUE_DATA and QUERY. Correct if needed. Avoid extra text, remove if some data is irrelevent and provide the final result, do not mention about TRUE_DATA, QUERY in the response .

    TRUE_DATA :
    ${trueData}
    
    QUERY :
    ${query}

    Final Answwer: your strightforward, informative and short complete response for user. In least words, no extra text, no tips, no explanation, just the answer.
    `;
    
    const correctorPrompt = `DRAFT_ANSWER : \n${draftAnswer}\n\nBased on all context, produce the final, small, corrected answer:`;
    return ollamaService.generate({ system: systemPrompt, prompt: correctorPrompt, modelName }, onData);
};

const generateDirectAnswer = async ({ query, historyText, trueData, modelName }: AnalysisParams, onData?: (chunk: any) => void) => {
    const systemPrompt = `You are a data analyst. Answer the query very briefly and strightforward using only the TRUE_DATA and HISTORY. Avoid tips or extra text, Do not mention about TRUE_DATA, QUERY in the response. Do not print the entire TRUE_DATA, just use it to answer the query in least words.

    TRUE_DATA :
    ${trueData}

    HISTORY :
    ${historyText}
    `;
    return ollamaService.generate({ system: systemPrompt, prompt: query, modelName }, onData);
};

const formatChatHistory = (history: Message[]): string => {
    return history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
}

interface RunAnalysisParams {
    chatHistory: Message[];
    trueData: string;
    modelName?: string;
    onData: (chunk: any) => void;
}

export const runAnalysis = async ({ chatHistory, trueData, modelName, onData }: RunAnalysisParams) => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    const isInitialCall = chatHistory.length === 0;

    if (isInitialCall) {
        const query = "Provide a general, concise analysis of the entire dataset. Start with the pre-computed summary, and conclude everything under 50 words";
        const draftResult = await generateDraftAnswer({ query, historyText: "", trueData, modelName });
        const draftAnswer = draftResult.data.response;
        await refineAndCorrectAnswer({ query, trueData, modelName, draftAnswer, historyText: "" }, onData);
    } else if (lastMessage?.sender === 'user') {
        const query = lastMessage.text;
        const historyText = formatChatHistory(chatHistory.slice(0, -1));
        await generateDirectAnswer({ query, historyText, trueData, modelName }, onData);
    }
};