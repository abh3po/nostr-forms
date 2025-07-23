import React, { useState } from 'react';
import { Button, Modal, Form, Input, List, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';

const { Text, Title } = Typography;

export const SectionManager: React.FC = () => {
  const { 
    sections, 
    addSection, 
    updateSection, 
    removeSection,
    questionsList 
  } = useFormBuilderContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleAddSection = () => {
    setEditingSection(null);
    form.resetFields();
    // Set default title for new section
    const sectionNumber = sections.length + 1;
    form.setFieldsValue({
      title: `Section ${sectionNumber}`,
      description: ''
    });
    setIsModalVisible(true);
  };

  const handleEditSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      form.setFieldsValue({
        title: section.title,
        description: section.description
      });
      setEditingSection(sectionId);
      setIsModalVisible(true);
    }
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (editingSection) {
        // Update existing section
        updateSection(editingSection, values);
      } else {
        // Add new section
        addSection(values.title, values.description);
      }
      setIsModalVisible(false);
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <Title level={5}>Form Sections</Title>
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleAddSection}
        block
        style={{ marginBottom: 16 }}
      >
        Add Section
      </Button>

      {sections.length === 0 ? (
        <Text type="secondary">No sections created yet</Text>
      ) : (
        <List
          dataSource={sections}
          renderItem={(section) => (
            <List.Item
              actions={[
                <Button 
                  key="edit" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditSection(section.id)}
                />,
                <Button 
                  key="delete" 
                  icon={<DeleteOutlined />} 
                  danger 
                  onClick={() => removeSection(section.id)}
                />
              ]}
            >
              <List.Item.Meta
                title={section.title || 'Untitled Section'}
                description={section.description}
              />
              <Text type="secondary">
                {section.questionIds.length} question(s)
              </Text>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Section Title"
            rules={[{ required: true, message: 'Please enter a section title' }]}
          >
            <Input placeholder="Enter section title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Section Description"
          >
            <Input.TextArea placeholder="Optional section description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};