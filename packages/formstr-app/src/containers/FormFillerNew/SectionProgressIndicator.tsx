import React from 'react';
import { Progress, Typography, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { SectionData } from '../CreateFormNew/providers/FormBuilder/typeDefs';

const { Text } = Typography;

interface SectionProgressIndicatorProps {
  sections: SectionData[];
  currentSection: number;
  completedSections: Set<number>;
  compact?: boolean;
}

export const SectionProgressIndicator: React.FC<SectionProgressIndicatorProps> = ({
  sections,
  currentSection,
  completedSections,
  compact = false
}) => {
  const totalSections = sections.length;
  const completedCount = completedSections.size;
  const progress = ((completedCount + (completedSections.has(currentSection) ? 0 : 0)) / totalSections) * 100;

  if (compact) {
    return (
      <Space align="center" style={{ width: '100%', marginBottom: 16 }}>
        <Progress 
          percent={Math.round(progress)} 
          showInfo={false}
          strokeColor="#FF5733"
          size="small"
          style={{ flex: 1 }}
        />
        <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          {currentSection + 1} of {totalSections}
        </Text>
      </Space>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {totalSections > 1 && (
          <Progress 
          percent={Math.round(progress)} 
          showInfo={false}
          strokeColor={{
            '0%': '#FF6B00',
            '100%': '#FF2E00',
          }}
          style={{ flex: 1 }}
        />
        )}
        <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          {completedCount} of {totalSections} completed
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {completedSections.has(currentSection) ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
        ) : (
          <ClockCircleOutlined style={{ color: '#faad14', fontSize: '14px' }} />
        )}
        <Text style={{ fontSize: '14px', fontWeight: 500 }}>
          {sections[currentSection]?.title || `Section ${currentSection + 1}`}
        </Text>
      </div>
    </div>
  );
};