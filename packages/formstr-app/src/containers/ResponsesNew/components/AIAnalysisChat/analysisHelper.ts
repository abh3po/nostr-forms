import { ollamaService } from "../../../../services/ollamaService";
import { Field, Tag } from "../../../../nostr/types";

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

export const generateDraftAnswer = async ({ query, historyText, trueData, modelName }: AnalysisParams) => {
    const systemPrompt = `You are a data analyst. Using the TRUE_DATA, generate a very small and strightforward analysis (under 50 words) of important things. Avoid extra text or insight.

    TRUE_DATA :
    ${trueData}
    
    `;
    console.log('DEBUG_1 : [Initial Flow - Step 1a] Sending Generator Prompt to Ollama:', { system: systemPrompt, prompt: query });
    const result = await ollamaService.generate({ system: systemPrompt, prompt: query, modelName });
    
    if (!result.success || !result.data?.response) {
        throw new Error(result.error || "Failed to generate initial response.");
    }
    console.log('DEBUG_2 : [Initial Flow - Step 1b] Received Draft Answer:', result.data.response);
    return result;
};

export const refineAndCorrectAnswer = async ({ query, historyText, trueData, modelName, draftAnswer }: AnalysisParams & { draftAnswer: string }, onData?: (chunk: any) => void) => {
    const systemPrompt = `You are a fact-checker. check the DRAFT_ANSWER using the TRUE_DATA and QUERY. Correct if needed. Avoid extra text, remove if some data is irrelevent and provide the final result, do not mention about TRUE_DATA, QUERY in the response .

    TRUE_DATA :
    ${trueData}
    
    QUERY :
    ${query}

    Final Answwer: your strightforward, informative and short complete response for user. Avoid extra text
    `;
    
    const correctorPrompt = `DRAFT_ANSWER : \n${draftAnswer}\n\nBased on all context, produce the final, corrected answer.`;
    console.log('DEBUG_3 : [Initial Flow - Step 2a] Sending Corrector Prompt to Ollama:', { system: systemPrompt, prompt: correctorPrompt });
    return ollamaService.generate({ system: systemPrompt, prompt: correctorPrompt, modelName }, onData);
};

export const generateDirectAnswer = async ({ query, historyText, trueData, modelName }: AnalysisParams, onData?: (chunk: any) => void) => {
    const systemPrompt = `You are a data analyst. Answer the query very briefly and strightforward using only the TRUE_DATA and HISTORY. Avoid tips or extra text, Do not mention about TRUE_DATA, QUERY in the response. Do not print the entire TRUE_DATA, just use it to answer the query.

    TRUE_DATA :
    ${trueData}

    HISTORY :
    ${historyText}
    `;
    console.log('DEBUG_5 : [Direct Flow] Sending Prompt to Ollama:', { system: systemPrompt, prompt: query });
    return ollamaService.generate({ system: systemPrompt, prompt: query, modelName }, onData);
};