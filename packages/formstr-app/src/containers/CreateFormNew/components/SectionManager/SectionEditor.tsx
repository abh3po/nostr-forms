import React, { useState } from 'react';
import { Button, Modal, Form, Input, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';
import { SectionData } from '../../providers/FormBuilder/typeDefs';

const { TextArea } = Input;
const { Text } = Typography;

interface SectionEditorProps {
  sectionId: string;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sectionId }) => {
  const { sections, updateSection } = useFormBuilderContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const section = sections.find(s => s.id === sectionId);
  
  if (!section) return null;
  
  const showModal = () => {
    form.setFieldsValue({
      title: section.title,
      description: section.description
    });
    setIsModalVisible(true);
  };
  
  const handleSave = () => {
    form.validateFields().then(values => {
      updateSection(sectionId, values);
      setIsModalVisible(false);
    });
  };
  
  return (
    <>
      <Button 
        type="text" 
        icon={<EditOutlined />} 
        onClick={showModal}
        style={{ float: 'right' }}
      >
        Edit Section
      </Button>
      
      <Modal
        title="Edit Section"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Section Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter section title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <TextArea placeholder="Enter section description" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SectionEditor;