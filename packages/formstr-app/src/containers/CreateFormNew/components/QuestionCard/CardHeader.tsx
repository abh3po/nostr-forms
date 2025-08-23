import React from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { ReactComponent as Asterisk } from "../../../../Images/asterisk.svg";
import StyledWrapper from "./CardHeader.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import useDeviceType from "../../../../hooks/useDeviceType";
import { classNames } from "../../../../utils/utility";
import DeleteButton from "./DeleteButton";
import { Field } from "../../../../nostr/types";

interface CardHeaderProps {
  required?: boolean;
  onRequired: (required: boolean) => void;
  question: Field;
  onReorderKey: (keyType: "UP" | "DOWN", tempId: string) => void;
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
  const { toggleSettingsWindow, deleteQuestion, setQuestionIdInFocus } =
    useFormBuilderContext();

  return (
    <StyledWrapper>
      <div className="action-wrapper">
        <div style={{ display: "flex" }}>
          {!firstQuestion && (
            <div
              className="action-icon"
              onMouseDown={(e) => {
                e.preventDefault();
                onReorderKey("UP", question[1]);
              }}
            >
              <ArrowUpOutlined className="icon-svg" />
            </div>
          )}
          {!lastQuestion && (
            <div
              className="action-icon"
              onMouseDown={(e) => {
                e.preventDefault();
                onReorderKey("DOWN", question[1]);
              }}
            >
              <ArrowDownOutlined className="icon-svg" />
            </div>
          )}
          <div className="action-icon">
            <Asterisk
              className={classNames("asterisk", { asteriskSelected: required })}
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
