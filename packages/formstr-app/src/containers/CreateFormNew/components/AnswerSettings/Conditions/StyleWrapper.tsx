import styled from "styled-components";

export const COLORS = {
  PRIMARY: '#1890ff',
  DANGER: '#ff4d4f',   
  SUCCESS: '#52c41a',   
  LIGHT_GRAY: '#f0f0f0', 
  MEDIUM_GRAY: '#d9d9d9', 
  LIGHT_BLUE_BG: '#f0f9ff', 
  LIGHT_BLUE_BORDER: '#e6f7ff', 
  VERY_LIGHT_GRAY: '#fafafa', 
  BETA_BADGE: '#722ed1', 
  TEXT_SECONDARY: 'rgba(0, 0, 0, 0.65)' };

export const BADGE_STYLES = {
  logicBadge: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  
  ruleSetBadge: {
    width: '28px', 
    height: '28px', 
    borderRadius: '4px', 
    background: COLORS.PRIMARY, 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: '10px',
    fontWeight: 'bold'
  },

  betaBadge: {
    backgroundColor: COLORS.BETA_BADGE,
    fontSize: '12px',
    fontWeight: 'bold'
  }
};

export const CARD_STYLES = {
  ruleSetCard: {
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
    borderRadius: '8px',
    borderColor: COLORS.MEDIUM_GRAY,
    borderWidth: '1px',
    borderStyle: 'solid' as 'solid'
  }
};

export const LAYOUT_STYLES = {
  fullWidthButton: {
    marginTop: 16, 
    width: '100%'
  },
  
  modalTitle: {
    display: 'flex' as 'flex', 
    alignItems: 'center' as 'center'
  },
  
  betaBadgeContainer: {
    marginLeft: '12px'
  }
};

const StyleWrapper = styled.div`
  .conditions {
    padding: 16px;
  }
  .property-title {
    margin-bottom: 16px;
    font-weight: 500;
  }
  .condition-rule {
    padding: 16px;
    border: 1px solid ${COLORS.LIGHT_GRAY};
    border-radius: 4px;
    margin-bottom: 16px;
  }
  .rule-item {
    margin-bottom: 12px;
    margin-top: 10px;
  }
  .rule-label {
    margin-top: 10px;
    margin-bottom: 10px;
    color: ${COLORS.TEXT_SECONDARY};
  }
  .condition-group {
    background: ${COLORS.LIGHT_BLUE_BG};
    border: 1px solid ${COLORS.LIGHT_BLUE_BORDER};
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .nested-content {
    margin-left: 8px;
    padding-left: 16px;
    border-left: 2px solid ${COLORS.PRIMARY};
    position: relative;
  }
  
  /* Add connecting lines */
  .nested-rule {
    position: relative;
  }
  
  .nested-rule:before {
    content: "";
    position: absolute;
    top: 0;
    left: -16px;
    height: 100%;
    width: 2px;
    background: ${COLORS.PRIMARY};
  }
  
  .logic-selector {
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 8px;
    background: ${COLORS.VERY_LIGHT_GRAY};
    border-radius: 4px;
  }
  .logic-label {
    display: block;
    margin-bottom: 5px;
    color: ${COLORS.TEXT_SECONDARY};
    font-size: 13px;
  }
  .remove-button {
    margin-top: 12px;
  }
  
  /* Rule sets and inter-group connections */
  .rule-set-card {
    border: 1px solid ${COLORS.MEDIUM_GRAY};
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
    overflow: hidden;
  }
  
  .inter-group-connector {
    margin: 16px 0;
    position: relative;
  }
  
  .logic-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    background: ${COLORS.PRIMARY};
    color: white;
    font-weight: 500;
    border-radius: 16px;
    font-size: 14px;
  }
  
  .logic-badge.or {
    background: ${COLORS.DANGER};
  }
`;

export default StyleWrapper;