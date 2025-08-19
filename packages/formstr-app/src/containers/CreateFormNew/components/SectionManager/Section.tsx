import React, { useState } from "react";
import { Typography, Divider, Button, Space, Input } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { SectionData } from "../../providers/FormBuilder/typeDefs";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import SectionDeleteButton from "./SectionDeleteButton";
import {
  SectionWrapper,
  StyledCard,
  OrangeStrip,
  SectionLabel,
} from "./Section.style";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SectionProps {
  section: SectionData;
  children: React.ReactNode;
  sectionIndex?: number;
  totalSections?: number;
}

const Section: React.FC<SectionProps> = ({ 
  section, 
  children, 
  sectionIndex = 1, 
  totalSections = 1 
}) => {
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
    <div style={{ marginBottom: '24px' }}>
      <SectionLabel>
        Section {sectionIndex} of {totalSections}
      </SectionLabel>
      
      <OrangeStrip />
      
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

        <StyledCard
          style={{
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
        </StyledCard>
      </div>
    </div>
  );
};

export default Section;