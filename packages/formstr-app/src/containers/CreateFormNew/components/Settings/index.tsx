import { forwardRef } from 'react';

import useFormBuilderContext from '../../hooks/useFormBuilderContext';
import AnswerSettings from '../AnswerSettings';
import FormSettings from '../FormSettings';

import StyleWrapper from './style';

// TODO: remove usage of any here
function Settings(_props: any, ref: any) {
  const { questionIdInFocus } = useFormBuilderContext();

  return (
    <StyleWrapper ref={ref} className="right-sidebar">
      {questionIdInFocus ? <AnswerSettings /> : <FormSettings />}
    </StyleWrapper>
  );
}

export default forwardRef(Settings);
