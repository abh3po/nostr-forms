import { GenerationResponse } from "../../services/ollamaService";
import { AIProcessingProps } from "./types";
import {generateQuestion}from "../../utils";
import { INPUTS_TYPES } from "../../configs/constants";

export const mapFieldTypeToFormType = (type: string = ''): string => {
  const typeStr = type.toLowerCase();

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

    const formName = response.fields[0]?.formName || 
                    response.formName || 
                    prompt.split(' ').slice(0, 3).join(' ') ||
                    'AI Generated Form';

    const formDescription = response.description || 
                          response.fields[0]?.description || 
                          `Form generated from prompt: ${prompt}`;
    
    const convertedFields = response.fields?.map((field: any, index: number) => {

      const fieldId = field.id || `field_${index}`;
      const formType = mapFieldTypeToFormType(field.type);
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

      const renderElement = mapTypeToRenderElement(formType);

      const settings = {
        required: !!field.required,
        renderElement,
        description: field.description || '',
        placeholder: field.placeholder || '',
        fieldId: fieldId,
        defaultValue: undefined,
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