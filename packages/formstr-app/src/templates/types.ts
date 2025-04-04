import { Field } from '../nostr/types';
import { IFormSettings } from '../containers/CreateFormNew/components/FormSettings/types';

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  initialState: {
    formName: string;
    formSettings: IFormSettings;
    questionsList: Field[];
  };
}