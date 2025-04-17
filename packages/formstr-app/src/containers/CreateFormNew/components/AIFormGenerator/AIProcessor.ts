import { GenerationResponse } from "../../services/ollamaService";
import { AIProcessingProps } from "./types";

export const mapFieldTypeToFormType = (type: string = ''): string => {
  // Convert to lowercase for case-insensitive matching
  const typeStr = type.toLowerCase();

  // Exact matching for the specific types we instructed the LLM to use
  switch (typeStr) {
    case 'multiple_choice':
      return 'MULTIPLE_CHOICE';
    case 'single_choice':
      return 'SINGLE_CHOICE';
    case 'dropdown':
      return 'SELECT';
    case 'paragraph':
      return 'PARAGRAPH';
    case 'number':
      return 'NUMBER';
    case 'date':
      return 'DATE';
    case 'time':
      return 'TIME';
    case 'short_text':
      return 'SHORT_ANSWER';
    default:
      // Fallback to more flexible matching for backward compatibility
      if (typeStr.includes('multiple') || typeStr.includes('checkbox')) {
        return 'MULTIPLE_CHOICE';
      } else if (typeStr.includes('single') || typeStr.includes('radio')) {
        return 'SINGLE_CHOICE';
      } else if (typeStr.includes('dropdown') || typeStr.includes('select')) {
        return 'SELECT';
      } else if (typeStr.includes('paragraph') || typeStr.includes('long')) {
        return 'PARAGRAPH';
      } else if (typeStr.includes('number')) {
        return 'NUMBER';
      } else if (typeStr.includes('date')) {
        return 'DATE';
      } else if (typeStr.includes('time')) {
        return 'TIME';
      } else {
        return 'SHORT_ANSWER';
      }
  }
};

export const mapTypeToRenderElement = (type: string): string => {
  switch (type) {
    case 'MULTIPLE_CHOICE': return 'checkboxes';
    case 'SINGLE_CHOICE': return 'radioButton';
    case 'SELECT': return 'dropdown';
    case 'PARAGRAPH': return 'paragraph';
    case 'NUMBER': return 'number';
    case 'DATE': return 'date';
    case 'TIME': return 'time';
    default: return 'shortText';
  }
};

export const processAIResponse = async (
  response: GenerationResponse, 
  prompt: string,
  props: AIProcessingProps
) => {
  const { updateQuestionsList, updateFormName, formSettings, updateFormSetting } = props;
  
  if (response.success && response.fields) {
    // Extract form name from the response or use a default based on the prompt
    const formName = response.fields[0]?.formName || 
                    response.formName || 
                    prompt.split(' ').slice(0, 3).join(' ') ||
                    'AI Generated Form';

    // Extract form description if available
    const formDescription = response.description || 
                          response.fields[0]?.description || 
                          `Form generated from prompt: ${prompt}`;

    // Convert the AI-generated fields to the format expected by Formstr
    const { generateQuestion } = await import('../../utils');
    const { INPUTS_TYPES } = await import('../../configs/constants');
    
    const convertedFields = response.fields?.map((field: any, index: number) => {
      // Ensure field has an ID
      const fieldId = field.id || `field_${index}`;
      
      // Map the AI field type to Formstr types
      const formType = mapFieldTypeToFormType(field.type);

      // Convert options to choices format if available
      let choices: [string, string][] = [];
      
      // Handle options for choice-based fields
      if (field.options && Array.isArray(field.options)) {
        // Make sure options are converted to strings to avoid 'object Object'
        choices = field.options.map((option: any, optIndex: number) => {
          const optionValue = typeof option === 'object' ? JSON.stringify(option) : String(option);
          return [String(optIndex), optionValue];
        });
      } else if ((formType === INPUTS_TYPES.MULTIPLE_CHOICE || 
                 formType === INPUTS_TYPES.SINGLE_CHOICE || 
                 formType === INPUTS_TYPES.SELECT) && 
                 (!field.options || !Array.isArray(field.options) || field.options.length === 0)) {
        // Default options if none provided but field type requires them
        choices = [
          ['0', 'Option 1'],
          ['1', 'Option 2'],
          ['2', 'Option 3']
        ];
      }

      // Determine primitive based on field type
      let primitive = 'text';
      if (formType === INPUTS_TYPES.MULTIPLE_CHOICE ||
          formType === INPUTS_TYPES.SINGLE_CHOICE ||
          formType === INPUTS_TYPES.SELECT) {
        primitive = 'option';
      } else if (formType === INPUTS_TYPES.NUMBER) {
        primitive = 'number';
      }

      // Map to correct renderElement
      const renderElement = mapTypeToRenderElement(formType);

      // Additional settings for the field
      const settings = {
        required: !!field.required,
        renderElement,
        description: field.description || '',
        placeholder: field.placeholder || '',
        fieldId: fieldId,
        defaultValue: undefined, // Add default property to the object
      };

      // Add default answer for required fields if specified
      if (field.required && field.defaultValue) {
        settings.defaultValue = field.defaultValue;
      }

      return generateQuestion(
        primitive,
        field.label || `Question ${index + 1}`,
        choices,
        settings
      );
    }) || [];

    // Update the form with the generated questions
    updateQuestionsList(convertedFields);
    updateFormName(formName);

    // Update form description
    updateFormSetting({
      ...formSettings,
      description: formDescription
    });
  }
};