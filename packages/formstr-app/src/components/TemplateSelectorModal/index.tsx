import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { initialTemplates, FormTemplate } from '../../templates'; 
import TemplateCard from '../TemplateCard';

interface TemplateSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect: (template: FormTemplate) => void;
  onOpenGalleryClick?: () => void;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  visible,
  onClose,
  onTemplateSelect,
  onOpenGalleryClick
}) => {

  const handleCardClick = (template: FormTemplate) => {
    onTemplateSelect(template);
    onClose();
  };

  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ textAlign: 'center', margin: 0 }}>
          Choose a Template
        </Typography.Title>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {onOpenGalleryClick && ( 
            <Button
              type="link"
              onClick={() => {
                  onOpenGalleryClick();
                  onClose();
              }}
            >
              View Full Template Gallery
            </Button>
          )}
        </div>
      }
      width={600}
      centered 
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '20px 0' }}>
        {initialTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={handleCardClick} 
          />
        ))}
      </div>
    </Modal>
  );
};

export default TemplateSelectorModal;