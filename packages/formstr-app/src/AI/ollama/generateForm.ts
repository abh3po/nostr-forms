import { FormResponse } from "../../nostr/types";

export const generateForm = async (prompt: string, url: string, model: string): Promise<FormResponse> => {
  if (!prompt) {
    throw new Error('Please enter a prompt.');
  }
  
  url = `${url}api/generate`;
  const systemInstruction = `
    You are a form creation assistant specialized in creating web forms
    Create a json response of a form like the following structure based on the prompt.\n
    The types of inputs are Types: shortText, paragraph, number, radioButton, checkboxes, date, dropdown, number, time
    
    Template:
    {
      fields: [
        {
          type: "Types",
          label: "Question text",
          key: "uniqueKey",
          required: boolean,
          options: ["Osption 1", "Option 2", "Option 3"] // Only for multiple-choice, single-choice, or dropdown fields
        },
        // Add more fields as needed
      ],
        "formName": "Form name based on the prompt",
        "description": "A comprehensive description for the form"
    }
    Important instruction: \n
    Strictly use only the type of inputs I have given \n
    Always include a form description that summarizes the purpose of the form\n
    Create all the objects in the fields based on the prompt given.
    Use options in the respected input type only if strictly given by the user,other don't give any.\nFor multiple_choice, single_choice, and dropdown fields, always provide an "options" array with at least 2-5 choices.\n
    Each field must have a unique key\n
    Return only the json objects of fields.
    Avoid Duplicate fields
  `;
  
  const fullPrompt = prompt + '\n';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        prompt: fullPrompt,
        system: systemInstruction,
        stream: false,
        format: 'json',
        temperature: 0.4,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.response) {
      try {
        const formJson = JSON.parse(data.response);
        const result = {
          formName: formJson.formName,
          description: formJson.description,
          fields: formJson.fields,
        };
        return result;
      } catch (err: any) {
        throw new Error('Failed to parse JSON response: ' + err.message);
      }
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
};