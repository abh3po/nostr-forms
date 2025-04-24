import { ArrowDownOutlined, ArrowUpOutlined, MoreOutlined } from '@ant-design/icons';
import React from 'react';

import { ReactComponent as Asterisk } from '../../../../Images/asterisk.svg';
import useDeviceType from '../../../../hooks/useDeviceType';
import { Field } from '../../../../nostr/types';
import { classNames } from '../../../../utils/utility';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';

import StyledWrapper from './CardHeader.style';
import DeleteButton from './DeleteButton';

interface CardHeaderProps {
  required?: boolean;
  onRequired: (required: boolean) => void;
  question: Field;
  onReorderKey: (keyType: 'UP' | 'DOWN', tempId: string) => void;
  firstQuestion: boolean;
  lastQuestion: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  required,
  onRequired,
  onReorderKey,
  question,
  firstQuestion,
  lastQuestion,
}) => {
  const { MOBILE } = useDeviceType();
  const { toggleSettingsWindow, deleteQuestion, setQuestionIdInFocus } = useFormBuilderContext();

  return (
    <StyledWrapper>
      <div className="action-wrapper">
        <div style={{ display: 'flex' }}>
          {!firstQuestion && (
            <div className="action-icon">
              <ArrowUpOutlined
                className="icon-svg"
                onClick={() => onReorderKey('UP', question[1])}
              />
            </div>
          )}
          {!lastQuestion && (
            <div className="action-icon">
              <ArrowDownOutlined
                className="icon-svg"
                onClick={() => onReorderKey('DOWN', question[1])}
              />
            </div>
          )}
          <div className="action-icon">
            <Asterisk
              className={classNames('asterisk', { asteriskSelected: required })}
              onClick={() => {
                onRequired(!required);
              }}
            />
          </div>
          <DeleteButton
            className="action-icon"
            onDelete={() => {
              deleteQuestion(question[1]);
              setQuestionIdInFocus(undefined);
            }}
          />
        </div>

        {MOBILE && (
          <div className="action-icon">
            <MoreOutlined onClick={toggleSettingsWindow} />
          </div>
        )}
      </div>
    </StyledWrapper>
  );
};

export default CardHeader;
