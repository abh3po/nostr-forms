import React from 'react';
import { Card, Typography } from 'antd';
import styled from 'styled-components';
import { FormTemplate } from '../../templates';

const { Text, Paragraph } = Typography;

const StyledCard = styled(Card)`
  width: 180px; // Adjust width as needed
  height: 120px; // Adjust height as needed
  margin: 8px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically */
  align-items: center; /* Center content horizontally */
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%; /* Ensure body takes full height */
  }
`;

interface TemplateCardProps {
  template: FormTemplate;
  onClick: (template: FormTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  return (
    <StyledCard hoverable onClick={() => onClick(template)}>
      <Text strong>{template.name}</Text>
      {template.description && (
        <Paragraph type="secondary" style={{ marginTop: '4px', marginBottom: 0 }} ellipsis={{ rows: 2 }}>
          {template.description}
        </Paragraph>
      )}
    </StyledCard>
  );
};

export default TemplateCard;