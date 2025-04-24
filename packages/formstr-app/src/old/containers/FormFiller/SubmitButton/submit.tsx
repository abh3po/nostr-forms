import { CheckCircleTwoTone, DownOutlined } from '@ant-design/icons';
import { Dropdown, Modal, Spin, MenuProps, FormInstance } from 'antd';
import React, { useState } from 'react';

interface SubmitButtonProps {
  selfSign: boolean | undefined;
  edit: boolean;
  form: FormInstance;
  onSubmit: (anonymous: boolean) => Promise<void>;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  selfSign,
  edit,
  form,
  onSubmit,
  disabled = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const signAndSubmit = async () => {
    await submitForm(false);
    setIsSigning(false);
    closeModal();
  };

  const submitForm = async (anonymous: boolean = true) => {
    try {
      await form.validateFields();
    } catch (err) {}
    let errors = form.getFieldsError().filter((e) => e.errors.length > 0);
    if (errors.length === 0) {
      await onSubmit(anonymous);
    }
  };

  const showModal = () => {
    setIsSigning(true);
    setIsModalOpen(true);
    signAndSubmit();
  };

  function closeModal() {
    setIsModalOpen(false);
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'signSubmition') {
      showModal();
    } else {
      submitForm();
    }
  };

  const handleButtonClick = () => {
    if (selfSign) {
      showModal();
      return;
    }
    submitForm();
  };
  const items = [
    {
      label: 'Submit Anonymously',
      key: 'submit',
      disabled: selfSign,
    },
    {
      label: edit ? 'Update Response' : 'Submit As Yourself',
      key: 'signSubmition',
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <>
      <Dropdown.Button
        menu={menuProps}
        type="primary"
        onClick={handleButtonClick}
        icon={<DownOutlined />}
        disabled={disabled}
        className="submit-button"
      >
        {selfSign ? (edit ? 'Update Response' : items[1].label) : 'Submit'}
      </Dropdown.Button>
      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        title="Nip-07 browser extension needed to sign"
      >
        {!isSigning && (
          <div>
            {' '}
            <CheckCircleTwoTone /> Access granted
          </div>
        )}
        {isSigning && (
          <div>
            <Spin size="small" /> Waiting for you to finish signing your response. Click{' '}
            <a
              href="https://nostrcheck.me/register/browser-extension.php"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>{' '}
            to read more about nip-07 signing.
          </div>
        )}
      </Modal>
    </>
  );
};
