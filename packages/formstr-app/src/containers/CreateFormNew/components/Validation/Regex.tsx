import { ValidationRuleTypes, RegexRule } from '@formstr/sdk/dist/interfaces';
import { Tooltip, Typography } from 'antd';
import { ChangeEvent, useState } from 'react';

import { isMobile } from '../../../../utils/utility';

import { InputStyle } from './validation.style';

const { Text } = Typography;

function isValidRegex(input: string): boolean {
  try {
    new RegExp(input);
    return true;
  } catch (error) {
    return false;
  }
}

function Regex({ rule, onChange }: { rule?: RegexRule; onChange: Function }) {
  const [patternError, setPatternError] = useState<string | null>(null);
  const [tempPattern, setTempPattern] = useState<string>(rule?.pattern || '');

  function handlePatternChange(e: ChangeEvent<HTMLInputElement>) {
    setTempPattern(e.target.value);
    if (!isValidRegex(e.target.value)) {
      setPatternError('Invalid regex pattern');
      return;
    }
    setPatternError(null);
    onChange(ValidationRuleTypes.regex, {
      pattern: e.target.value,
      errorMessage: rule?.errorMessage,
    });
  }

  function handleErrorMessageChange(e: ChangeEvent<HTMLInputElement>) {
    if (!rule?.pattern) {
      setPatternError('Pattern is required');
      return;
    }
    onChange(ValidationRuleTypes.regex, {
      pattern: rule?.pattern,
      errorMessage: e.target.value,
    });
  }

  return (
    <>
      <Tooltip
        title="Enter a regex pattern to match against the response"
        trigger={isMobile() ? 'click' : 'hover'}
      >
        <InputStyle>
          <Text className="property-name">Pattern:</Text>
          <input className="number-input" value={tempPattern} onChange={handlePatternChange} />
        </InputStyle>
      </Tooltip>
      {patternError && <Text type="danger">{patternError}</Text>}
      <InputStyle>
        <Text className="property-name">Error Message</Text>
        <input
          className="number-input"
          type="text"
          value={rule?.errorMessage}
          onChange={handleErrorMessageChange}
        />
      </InputStyle>
    </>
  );
}

export default Regex;
