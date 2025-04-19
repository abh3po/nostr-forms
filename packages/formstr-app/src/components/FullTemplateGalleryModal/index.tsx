import React from 'react';
import { Modal, Typography } from 'antd';
import { availableTemplates, FormTemplate} from '../../templates';
import TemplateCard from '../TemplateCard';
import { templateCategories ,groupTemplatesByCategory} from '../../templates/categories';

interface FullTemplateGalleryModalProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect: (template: FormTemplate) => void;
}

const FullTemplateGalleryModal: React.FC<FullTemplateGalleryModalProps> = ({
  visible,
  onClose,
  onTemplateSelect,
}) => {
    const handleCardClick = (template: FormTemplate) => {
        onTemplateSelect(template);
        onClose();
      };

      const groupedTemplates = groupTemplatesByCategory(availableTemplates, templateCategories);
    
  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ textAlign: 'center', margin: 0 }}>
          Template Gallery
        </Typography.Title>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={850}
      centered
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {groupedTemplates.map(({ category, templates }) => (
        <div key={category.id} style={{ marginBottom: '24px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', marginLeft: '8px' }}>
            {category.title}
          </Typography.Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
        ))}
    </Modal>
  );
};

export default FullTemplateGalleryModal;