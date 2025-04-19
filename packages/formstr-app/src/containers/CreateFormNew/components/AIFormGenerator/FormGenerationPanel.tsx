import React from 'react';
import { Select, Input, Button, Typography, Alert, Tooltip } from 'antd';
import { FormGenerationPanelProps } from './types';
import { InfoCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Option } = Select;

const FormGenerationPanel: React.FC<FormGenerationPanelProps> = ({
  formType,
  setFormType,
  formTypes,
  prompt,
  setPrompt,
  onGenerate,
  loading,
  disabled,
  error
}) => {
  const placeholdersByType = {
    'survey': "Create a customer satisfaction survey with questions about service quality, product features, and overall satisfaction ratings.",
    'contact': "Create a contact form for a web design agency that collects name, email, phone, project type, budget range, and project description.",
    'registration': "Create a workshop registration form that collects attendee details, workshop preferences, and accommodates accessibility needs.",
    'feedback': "Create a product feedback form with ratings for ease of use, reliability, customer support, and areas for improvement.",
    'application': "Create a job application form for a software developer position with education, experience, and skills sections.",
    'event': "Create an event registration form for a tech conference with session preferences, dietary requirements, and t-shirt size.",
    'custom': "Create a form for [describe your purpose]..."
  };

  return (
    <>
      <div>
        <Text>Form Type</Text>
        <Select
          style={{ width: '100%' }}
          value={formType}
          onChange={(value) => {
            setFormType(value);
            // When form type changes, set a helpful placeholder
            if (!prompt || prompt === placeholdersByType[formType as keyof typeof placeholdersByType]) {
              setPrompt('');
            }
          }}
        >
          {formTypes.map(type => (
            <Option key={type.value} value={type.value}>{type.label}</Option>
          ))}
        </Select>
      </div>

      <div className="prompt-input">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <Text>Describe the form you want to create</Text>
          <Tooltip title="Be specific about fields, validation, and any special requirements. The more details you provide, the better the form will match your needs.">
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </div>

        <TextArea
          rows={4}
          placeholder={placeholdersByType[formType as keyof typeof placeholdersByType] || "Describe your form requirements..."}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />

        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              const examples = {
                'survey': "Create a detailed customer satisfaction survey for an e-commerce website with sections for product quality, website usability, and delivery experience. Include open-ended feedback questions. Make the name, email and overall satisfaction rating required fields.",
                'contact': "Create a comprehensive contact form for a marketing agency that collects full name, email, phone number, company size, budget range, service interests (multiple choice from: SEO, Content Marketing, Social Media, PPC), project timeline, and how they heard about us. The name, email and service interests should be required fields.",
                'registration': "Create a coding bootcamp application form that collects personal information, programming experience level (none, beginner, intermediate, advanced), preferred programming languages (multiple selection), learning goals, and availability for different course schedules. Make email, experience level and availability required.",
                'feedback': "Create a detailed restaurant feedback form with sections for food quality, service, ambiance, and value for money using 5-star ratings. Include fields for specific dishes ordered, wait time, server name, and open-ended suggestions for improvement. The overall rating and visit date should be required.",
                'application': "Create an internship application form for a tech company with fields for personal details, education history, relevant skills (multiple choice), programming languages known (multiple selection), availability dates, and a personal statement section. All fields except for the personal statement should be required.",
                'event': "Create a conference registration form with attendee information, session track preferences (choose from: Technical, Business, Design, Leadership), meal preferences (vegetarian, vegan, no restrictions, other), t-shirt size, and special accommodation needs. Name, email and session track are required fields.",
                'custom': "Create a neighborhood community garden plot request form with applicant details, plot size preference (small, medium, large), gardening experience level, preferred location in the garden (dropdown with north, south, east, west options), willingness to volunteer hours, and specific plants they intend to grow. Make the contact information and volunteer hours commitment required fields."
              };

              setPrompt(examples[formType as keyof typeof examples] || examples['custom']);
            }}
          >
            Load example prompt
          </Button>
        </div>

        <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: 4 }}>
          Include details about required fields, field types, and validation rules for best results.
        </Paragraph>
      </div>

      <Button
        type="primary"
        block
        onClick={onGenerate}
        loading={loading}
        disabled={disabled || !prompt.trim()}
      >
        Generate Form
      </Button>

      {error && (
        <Alert type="error" message={error} showIcon />
      )}
    </>
  );
};

export default FormGenerationPanel;