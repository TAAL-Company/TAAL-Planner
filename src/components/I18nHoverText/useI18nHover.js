import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const HEBREW_LANGUAGE = 'Hebrew';

// Central hook: current-language text + Hebrew translation + popover hover state for one i18n key.
export default function useI18nHover(translationKey, options) {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const text = translationKey ? t(translationKey, options) : undefined;

  const isHebrewActive = i18n.language === HEBREW_LANGUAGE;
  // i18n.exists is the source of truth for "translation missing" — avoids ever showing the raw key.
  const hasHebrewTranslation =
    !isHebrewActive &&
    !!translationKey &&
    i18n.exists(translationKey, { lng: HEBREW_LANGUAGE });
  const hebrewText = hasHebrewTranslation
    ? i18n.getFixedT(HEBREW_LANGUAGE)(translationKey, options)
    : null;

  const showPopover = hasHebrewTranslation && !!hebrewText && hebrewText.trim() !== '';

  const handlePopoverOpen = useCallback(
    (event) => {
      if (showPopover) setAnchorEl(event.currentTarget);
    },
    [showPopover]
  );

  const handlePopoverClose = useCallback(() => setAnchorEl(null), []);

  return {
    text,
    hebrewText,
    showPopover,
    isOpen: showPopover && Boolean(anchorEl),
    anchorEl,
    handlePopoverOpen,
    handlePopoverClose,
  };
}
