import { useContext } from 'react';

import { FormBuilderContext } from '../providers/FormBuilder';

export default function useFormBuilderContext() {
  return useContext(FormBuilderContext);
}
