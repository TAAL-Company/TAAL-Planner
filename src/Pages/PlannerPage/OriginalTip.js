import React from 'react';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { originalOf } from './originalText';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#ffffff',
    color: '#333',
    fontSize: '13px',
    fontFamily: 'Assistant, sans-serif',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    maxWidth: 280,
    direction: 'auto',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#ffffff',
    '&::before': { border: '1px solid #e0e0e0', boxSizing: 'border-box' },
  },
}));

// Wraps a single element; shows the original (untranslated) text on hover when one exists.
const OriginalTip = ({ text, children }) => {
  const original = originalOf(text);
  if (!original) return children;
  return (
    <StyledTooltip
      title={<span style={{ whiteSpace: 'pre-wrap' }}>{original}</span>}
      arrow
      placement="top"
      enterDelay={250}
    >
      {children}
    </StyledTooltip>
  );
};

export default OriginalTip;
