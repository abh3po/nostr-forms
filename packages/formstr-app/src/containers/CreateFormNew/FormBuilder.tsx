import { useRef } from 'react';

import { QuestionsList } from './components/QuestionsList';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import useFormBuilderContext from './hooks/useFormBuilderContext';
import { useOutsideClickHandler } from './hooks/useOutsideClickHandler';
import StyledWrapper from './index.style';

function FormBuilder() {
  const leftSidebarRef = useRef<HTMLInputElement>(null);
  const rightSidebarRef = useRef<HTMLInputElement>(null);

  const {
    isRightSettingsOpen,
    isLeftMenuOpen,
    closeSettingsOnOutsideClick,
    closeMenuOnOutsideClick,
  } = useFormBuilderContext();

  useOutsideClickHandler(leftSidebarRef, closeMenuOnOutsideClick);
  useOutsideClickHandler(rightSidebarRef, closeSettingsOnOutsideClick);

  return (
    <StyledWrapper $isOpen={isLeftMenuOpen} $isRightSettingsOpen={isRightSettingsOpen}>
      <div style={{ display: 'flex', maxWidth: '100vw' }}>
        <Sidebar ref={leftSidebarRef} />
        <QuestionsList />
        <Settings ref={rightSidebarRef} />
      </div>
    </StyledWrapper>
  );
}

export default FormBuilder;
