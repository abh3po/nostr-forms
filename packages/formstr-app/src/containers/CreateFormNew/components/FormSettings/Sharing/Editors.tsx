import { Modal } from 'antd';

import { useProfileContext } from '../../../../../hooks/useProfileContext';
import useFormBuilderContext from '../../../hooks/useFormBuilderContext';

import { NpubList } from './NpubList';

interface EditorProps {
  open: boolean;
  onCancel: () => void;
}

export const Editors: React.FC<EditorProps> = ({ open, onCancel }) => {
  const { pubkey: userPubkey, requestPubkey } = useProfileContext();
  const { editList, setEditList } = useFormBuilderContext();
  return (
    <Modal open={open} onCancel={onCancel} footer={null}>
      <NpubList NpubList={editList} setNpubList={setEditList} ListHeader={'Add Admins'} />
    </Modal>
  );
};
