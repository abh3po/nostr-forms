import { IFormSettings } from '../containers/CreateFormNew/components/FormSettings/types';
import { Field } from '../nostr/types';

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
