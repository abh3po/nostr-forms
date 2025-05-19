import { useState } from "react";
import {PlusOutlined} from "@ant-design/icons";

function GradientCreateFormButton() {
    const [hover, setHover] = useState(false);
  
    return (<div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 17px',
        fontSize: '14px',
        height: '24px',
        background: 'linear-gradient(to bottom, rgb(255, 106, 0), rgb(255, 25, 0))',
        color: '#ffffff',
        borderRadius: '6px',
        cursor: 'pointer',
        lineHeight: '1.0',
        top: '4px',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.25)',
          opacity: hover ? 1 : 0,
          transition: 'opacity 0.15s ease-in-out',
          zIndex: 0,
        }}
      />
      <PlusOutlined style={{ zIndex: 1, marginRight: '6px' }} />
      <span style={{ position: 'relative', top: '2px', zIndex: 1 }}>Create Form</span>
    </div>
    );
  }

export default GradientCreateFormButton;