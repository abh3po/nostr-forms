import axios from 'axios';

export interface FormField {
  type: string;
  label: string;
  name: string;
  options?: string[];
}

export interface FormResponse {
  fields: FormField[];
}

export const generateFormFromPrompt = async (prompt: string, model: string = 'gemma:2b'): Promise<FormResponse> => {
  if (!prompt) {
    throw new Error('Please enter a prompt.');
  }

  const instruction = `
    Create a json response of a form like the following structure based on the prompt.\n
    The types of inputs are <types>: shortText, paragraph, radioButton, checkboxes, date, dropdown, number, time, country

    Template:
    {
      fields: [
        {
          type: "<type>",
          label: "<label>",
          key: "<name>",
          options: <only if user specifies any options applicable to this input type only>
        },
        ...
        {
          type: "<type>",
          label: "<label>",
          key: "<name>",
          options: <only if user specifies any options applicable to this input type only>
        }
      ]
    }
    Important instruction: \n
    Strictly use only the type of inputs I have given \n
    Create all the objects in the fields based on the prompt given.\n
    Use options in the respected input type only if strictly given by the user,other don't give any.\n
    Return only the json objects of fields.
  `;
  
  const fullPrompt = prompt + '\n' + instruction;

  try {
    const res = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: model,
      prompt: fullPrompt,
      stream: false,
      format: 'json',
      options: { temperature: 0.4 },
    });

    if (res.data && res.data.response) {
      try {
        // Parse the JSON response
        const formJson = JSON.parse(res.data.response);
        return formJson as FormResponse;
      } catch (err : any) {
        // In case the response isn't valid JSON
        console.log("Raw response:", res.data.response);
        throw new Error('Failed to parse JSON response: ' + err.message);
      }
    } else {
      console.log("Unexpected response:", res.data);
      throw new Error('Unexpected response format');
    }
  } catch (err: any) {
    console.error("API error:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};