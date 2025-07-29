import React, { useState } from "react";
import { Typography, Divider, Card, Button, Space, Input } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { SectionData } from "../../providers/FormBuilder/typeDefs";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import SectionDeleteButton from "./SectionDeleteButton";

const { Title, Text } = Typography;
const { TextArea } = Input;

const SectionWrapper = styled.div`
  margin-bottom: 24px;

  .section-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .section-title {
    font-size: 18px;
    font-weight: 500;
    width: 100%;
    margin-bottom: 8px;
  }

  .section-title-input {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .section-description {
    color: rgba(0, 0, 0, 0.65);
    width: 100%;
  }

  .section-content {
    margin-top: 16px;
  }

  .section-actions {
    display: flex;
    gap: 8px;
    margin-left: 16px;
  }

  .collapsed-indicator {
    margin-left: 8px;
    color: rgba(0, 0, 0, 0.45);
  }

  .drop-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(24, 144, 255, 0.1);
    border: 2px dashed #1890ff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    pointer-events: none;
  }
`;

interface SectionProps {
  section: SectionData;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ section, children }) => {
  const {
    updateSection,
    removeSection,
    moveQuestionToSection,
    deleteQuestion,
  } = useFormBuilderContext();
  const [collapsed, setCollapsed] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDelete = () => {
    removeSection(section.id);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSection(section.id, { title: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateSection(section.id, { description: e.target.value });
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const questionId = e.dataTransfer.getData("questionId");
    if (questionId) {
      moveQuestionToSection(questionId, section.id);
    }
  };

  const handleDeleteWithQuestions = () => {
    section.questionIds.forEach((questionId) => {
      deleteQuestion(questionId);
    });
    removeSection(section.id);
  };

  return (
    <div
      style={{ position: "relative" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDropTarget && (
        <div className="drop-indicator">
          <Text strong>Drop question here</Text>
        </div>
      )}

      <Card
        style={{
          marginBottom: 24,
          position: "relative",
          transition: "all 0.2s",
          border: isDropTarget ? "1px solid #1890ff" : "1px solid #f0f0f0",
        }}
        extra={
          <Space>
            <Button
              type="text"
              icon={collapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <SectionDeleteButton
              onDelete={handleDelete}
              onDeleteWithQuestions={handleDeleteWithQuestions}
              questionCount={section.questionIds.length}
              sectionTitle={section.title}
              className="action-icon"
            />
          </Space>
        }
      >
        <SectionWrapper>
          <div className="section-header">
            <div style={{ width: "100%" }}>
              <Input
                className="section-title-input"
                value={section.title || ""}
                onChange={handleTitleChange}
                placeholder="Section title"
                onClick={(e) => e.stopPropagation()}
                bordered={false}
              />

              {!collapsed && (
                <TextArea
                  className="section-description"
                  value={section.description || ""}
                  onChange={handleDescriptionChange}
                  placeholder="Click to edit section description"
                  autoSize
                  bordered={false}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>

          {!collapsed && (
            <>
              <Divider />
              <div className="section-content">{children}</div>
            </>
          )}
        </SectionWrapper>
      </Card>
    </div>
  );
};

export default Section;
