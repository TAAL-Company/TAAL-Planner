import React, { useRef } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import useI18nHover from './useI18nHover';

let popoverIdCounter = 0;
function useStablePopoverId() {
  const idRef = useRef(null);
  if (idRef.current === null) {
    popoverIdCounter += 1;
    idRef.current = `hebrew-translation-popover-${popoverIdCounter}`;
  }
  return idRef.current;
}

/**
 * Displays i18n-translated text and, on hover, an MUI Popover with the Hebrew
 * translation of the same key — unless the active language already is Hebrew.
 */
export default function I18nHoverText({
  translationKey,
  options,
  component: Component = 'span',
  children,
  ...rest
}) {
  const popoverId = useStablePopoverId();
  const { text, hebrewText, showPopover, isOpen, anchorEl, handlePopoverOpen, handlePopoverClose } =
    useI18nHover(translationKey, options);

  const displayText = children !== undefined ? children : text;
  const { onMouseEnter, onMouseLeave, ...restProps } = rest;

  if (!showPopover) {
    return (
      <Component {...rest}>
        {displayText}
      </Component>
    );
  }

  return (
    <Component
      {...restProps}
      aria-owns={isOpen ? popoverId : undefined}
      aria-haspopup="true"
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        handlePopoverOpen(event);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        handlePopoverClose();
      }}
    >
      {displayText}
      <Popover
        id={popoverId}
        sx={{ pointerEvents: 'none' }}
        open={isOpen}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }} dir="rtl">
          {hebrewText}
        </Typography>
      </Popover>
    </Component>
  );
}
